import os
import numpy as np

from pathlib import Path
import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import (
    cross_val_score,
    train_test_split,
    StratifiedKFold,
    RandomizedSearchCV,
)
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "saved_models"
MODELS_DIR.mkdir(exist_ok=True)
DATA_PATH = BASE_DIR / "data" / "loan_data.csv"

data = pd.read_csv(DATA_PATH)
data.columns = data.columns.str.strip()

# Basic label mapping and validation
if "loan_status" not in data.columns:
    raise ValueError("Missing loan_status column after column cleanup.")

data["loan_status"] = (
    data["loan_status"].astype(str).str.strip().map({"Approved": 1, "Rejected": 0})
)
if data["loan_status"].isnull().any():
    raise ValueError("Unexpected values found in loan_status column.")
data["loan_status"] = data["loan_status"].astype(int)

# Feature engineering
asset_columns = [
    "residential_assets_value",
    "commercial_assets_value",
    "luxury_assets_value",
    "bank_asset_value",
]
for col in asset_columns:
    if col not in data.columns:
        raise ValueError(f"Missing expected column: {col}")

data["total_asset_value"] = data[asset_columns].sum(axis=1)
data["income_per_dependent"] = (
    data["income_annum"] / np.maximum(data["no_of_dependents"] + 1, 1)
)
data["loan_to_income_ratio"] = data["loan_amount"] / np.maximum(data["income_annum"], 1)
data["asset_to_loan_ratio"] = data["total_asset_value"] / np.maximum(data["loan_amount"], 1)

# Prepare features and target
X = data.drop(["loan_id", "loan_status"], axis=1)
y = data["loan_status"]

categorical_features = ["education", "self_employed"]
numeric_features = [
    col
    for col in X.select_dtypes(include=["int64", "float64"]).columns
    if col not in categorical_features
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "num",
            Pipeline(
                [
                    ("imputer", SimpleImputer(strategy="median")),
                    ("scaler", StandardScaler()),
                ]
            ),
            numeric_features,
        ),
        (
            "cat",
            Pipeline(
                [
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore")),
                ]
            ),
            categorical_features,
        ),
    ],
    remainder="drop",
)

# Preprocessor for tree models (no scaling)
preprocessor_noscale = ColumnTransformer(
    transformers=[
        (
            "num",
            Pipeline([
                ("imputer", SimpleImputer(strategy="median")),
            ]),
            numeric_features,
        ),
        (
            "cat",
            Pipeline(
                [
                    ("imputer", SimpleImputer(strategy="most_frequent")),
                    ("encoder", OneHotEncoder(handle_unknown="ignore")),
                ]
            ),
            categorical_features,
        ),
    ],
    remainder="drop",
)

# Train/test split with stratification
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

# Further split training set to create a validation set (no test leakage)
X_train, X_val, y_train, y_val = train_test_split(
    X_train,
    y_train,
    test_size=0.2,
    random_state=42,
    stratify=y_train,
)

print("Target distribution:")
print(y.value_counts(normalize=True))
print("\nTrain target counts:")
print(y_train.value_counts())

negative = (y_train == 0).sum()
positive = (y_train == 1).sum()
scale_pos_weight = negative / positive if positive > 0 else 1.0
print(
    f"scale_pos_weight={scale_pos_weight:.3f} (negative={negative}, positive={positive})"
)

cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

baseline_models = {
    "logistic_regression": LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
    ),
    "random_forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    ),
    "xgboost": XGBClassifier(
        random_state=42,
        eval_metric="logloss",
        n_jobs=-1,
        scale_pos_weight=scale_pos_weight,
        n_estimators=500,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
    ),
}

param_distributions = {
    "logistic_regression": {
        "classifier__C": [0.01, 0.1, 1, 10, 100],
        "classifier__solver": ["liblinear", "lbfgs"],
    },
    "random_forest": {
        "classifier__n_estimators": [200, 500, 1000],
        "classifier__max_depth": [None, 5, 10, 20],
        "classifier__min_samples_split": [2, 5, 10],
        "classifier__min_samples_leaf": [1, 2, 4],
        "classifier__max_features": ["sqrt", "log2"],
    },
    "xgboost": {
        "classifier__n_estimators": [100, 300, 500],
        "classifier__max_depth": [3, 5, 7],
        "classifier__learning_rate": [0.01, 0.05, 0.1],
        "classifier__subsample": [0.7, 0.8, 1.0],
        "classifier__colsample_bytree": [0.7, 0.8, 1.0],
        "classifier__min_child_weight": [1, 3, 5],
    },
}

search_iterations = {
    "logistic_regression": 10,
    "random_forest": 30,
    "xgboost": 40,
}


def optimize_threshold(model, X_val, y_val):
    probabilities = model.predict_proba(X_val)[:, 1]
    best_threshold = 0.5
    best_f1 = 0.0
    for threshold in [i / 100 for i in range(10, 91)]:
        predictions = (probabilities >= threshold).astype(int)
        score = f1_score(y_val, predictions)
        if score > best_f1:
            best_f1 = score
            best_threshold = threshold
    return best_threshold, best_f1


def evaluate_model(name, model, X_eval, y_eval, threshold=0.5):
    predictions = (model.predict_proba(X_eval)[:, 1] >= threshold).astype(int)
    return {
        "accuracy": accuracy_score(y_eval, predictions),
        "precision": precision_score(y_eval, predictions),
        "recall": recall_score(y_eval, predictions),
        "f1": f1_score(y_eval, predictions),
    }

best_model_name = None
best_model = None
best_result = {"f1": 0.0}
best_cv_score = 0.0
EPSILON = 0.001
model_priority = {
    "logistic_regression": 1,
    "random_forest": 2,
    "xgboost": 3,
}
best_threshold = 0.5

for name, base_model in baseline_models.items():
    print(f"\n=== Baseline evaluation: {name} ===")
    
    # choose preprocessor: scale only for logistic regression
    chosen_preprocessor = preprocessor if name == "logistic_regression" else preprocessor_noscale
    pipeline = Pipeline([("preprocessor", chosen_preprocessor), ("classifier", base_model)])
    baseline_scores = cross_val_score(
        pipeline,
        X_train,
        y_train,
        cv=cv,
        scoring="f1",
        n_jobs=-1,
    )
    print(
        f"Baseline CV F1 mean: {baseline_scores.mean():.4f} (+/- {baseline_scores.std():.4f})"
    )

    search = RandomizedSearchCV(
        pipeline,
        param_distributions[name],
        n_iter=search_iterations[name],
        scoring="f1",
        cv=cv,
        n_jobs=-1,
        random_state=42,
        verbose=1,
        refit=True,
    )
    search.fit(X_train, y_train)

    print(f"Best parameters for {name}: {search.best_params_}")
    print(f"Best CV F1 for {name}: {search.best_score_:.4f}")

    tuned_model = search.best_estimator_

    # optimize threshold on validation set (no test leakage)
    threshold, val_f1 = optimize_threshold(tuned_model, X_val, y_val)

    # evaluate on the untouched test set using threshold chosen on validation
    test_metrics = evaluate_model(name, tuned_model, X_test, y_test, threshold=threshold)

    print(f"Optimized threshold (from validation): {threshold:.2f}")
    print(f"Validation F1 at threshold {threshold:.2f}: {val_f1:.4f}")
    print(f"Test set F1 at threshold {threshold:.2f}: {test_metrics['f1']:.4f}")
    print(f"Accuracy: {test_metrics['accuracy']:.4f}")
    print(f"Precision: {test_metrics['precision']:.4f}")
    print(f"Recall: {test_metrics['recall']:.4f}")

    joblib.dump(tuned_model, MODELS_DIR / f"tuned_{name}.pkl")

    # select best model based on CV score (more reliable than a single val split)
    current_cv_score = search.best_score_
    if current_cv_score > best_cv_score + EPSILON:
        best_cv_score = current_cv_score
        best_result = {
            **test_metrics,
            "val_f1": val_f1,
            "test_f1": test_metrics["f1"],
            "f1": val_f1,
            "threshold": threshold,
            "cv_f1": current_cv_score,
        }
        best_model = tuned_model
        best_model_name = name
        best_threshold = threshold
    else:
        # handle near-ties: prefer simpler model (lower priority value)
        if abs(current_cv_score - best_cv_score) <= EPSILON:
            if best_model_name is None or model_priority.get(name, 999) < model_priority.get(best_model_name, 999):
                best_cv_score = current_cv_score
                best_result = {
                    **test_metrics,
                    "val_f1": val_f1,
                    "test_f1": test_metrics["f1"],
                    "f1": val_f1,
                    "threshold": threshold,
                    "cv_f1": current_cv_score,
                }
                best_model = tuned_model
                best_model_name = name
                best_threshold = threshold


if best_model is None:
    raise RuntimeError("No tuned model was successfully trained.")


joblib.dump(best_model, MODELS_DIR / "best_model.pkl")
final_metrics = evaluate_model(best_model_name, best_model, X_test, y_test, threshold=best_threshold)
print(f"\nBest overall model (selected by CV F1): {best_model_name}")
print(f"Best CV F1: {best_cv_score:.4f}")
print(f"Threshold chosen on validation: {best_threshold:.2f}")
print("Final test metrics for selected model:")
print(f"  Accuracy: {final_metrics['accuracy']:.4f}")
print(f"  Precision: {final_metrics['precision']:.4f}")
print(f"  Recall: {final_metrics['recall']:.4f}")
print(f"  F1: {final_metrics['f1']:.4f}")
print("Saved tuned models to saved_models/")
