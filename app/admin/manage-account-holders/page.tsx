"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { addLoader, removeLoader } from "@/app/global_components/loader";
import {
  getPaymentMethods,
  PaymentMethod,
  PaymentMethodKey,
} from "@/app/payment-methods";
import { Poppins, Ubuntu } from "next/font/google";
import { useRouter } from "next/navigation";

import { customAlert } from "../custom-alert";
import styles from "./manage-account-holders.module.css";

const title = Poppins({ weight: ["600", "700"], subsets: ["latin"] });
const ubuntu = Ubuntu({ weight: ["300", "400", "700"], subsets: ["latin"] });

type AccountHolder = {
  id: number;
  username: string;
  allowed_methods: PaymentMethodKey[];
};

type MethodSelectorProps = {
  selected: PaymentMethodKey[];
  onToggle: (method: PaymentMethodKey) => void;
  methods: PaymentMethod[];
  disabled?: boolean;
};

function MethodSelector({
  selected,
  onToggle,
  methods,
  disabled,
}: MethodSelectorProps) {
  return (
    <div className={styles.methodsGrid}>
      {methods.map((method) => {
        const Icon = method.icon;
        const active = selected.includes(method.identifier);
        return (
          <button
            type="button"
            key={method.identifier}
            className={`${styles.methodCard} ${
              active ? styles.methodCardActive : styles.methodCardInactive
            }`}
            onClick={() => onToggle(method.identifier)}
            disabled={disabled}
            title={`${active ? "Remove" : "Allow"} ${method.displayName}`}
          >
            <div className={styles.methodAction}>{active ? "×" : "+"}</div>
            <span className={styles.methodIconWrapper}>
              <Icon />
            </span>

            <div className={styles.methodTitle}>{method.displayName}</div>
            <div className={styles.methodMeta}>{method.to}</div>
          </button>
        );
      })}
    </div>
  );
}

export default function ManageAccountHolders() {
  const router = useRouter();
  const paymentMethods = useMemo(
    () =>
      getPaymentMethods().filter(
        (method) => !method.automatic && method.identifier !== "CASH"
      ),
    []
  );
  const allowedKeys = useMemo(
    () => paymentMethods.map((method) => method.identifier),
    [paymentMethods]
  );

  const [accountHolders, setAccountHolders] = useState<AccountHolder[]>([]);
  const [newHolder, setNewHolder] = useState({ username: "", password: "" });
  const [newHolderMethods, setNewHolderMethods] = useState<PaymentMethodKey[]>(
    []
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingMethods, setEditingMethods] = useState<PaymentMethodKey[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const normalizeMethods = useCallback(
    (methods: unknown): PaymentMethodKey[] => {
      if (!Array.isArray(methods)) return [];
      return methods.filter((method): method is PaymentMethodKey =>
        allowedKeys.includes(method as PaymentMethodKey)
      );
    },
    [allowedKeys]
  );

  const fetchAccountHolders = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/manage-account-holders");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      if (Array.isArray(data.accountHolders)) {
        setAccountHolders(
          data.accountHolders.map((holder: any) => ({
            id: holder.id,
            username: holder.username,
            allowed_methods: normalizeMethods(holder.allowed_methods),
          }))
        );
      } else {
        setAccountHolders([]);
      }
    } catch (error) {
      customAlert("Failed to load account holders.");
    }
  }, [normalizeMethods, router]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      addLoader();
      try {
        const authResponse = await fetch("/api/admin/auth");
        const authData = await authResponse.json();
        if (authResponse.status !== 200 || authData.role !== "admin") {
          router.push("/admin/login");
          return;
        }
        if (!cancelled) {
          await fetchAccountHolders();
        }
      } catch (error) {
        router.push("/admin/login");
      } finally {
        removeLoader();
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [fetchAccountHolders, router]);

  const toggleSelection = (
    method: PaymentMethodKey,
    setter: React.Dispatch<React.SetStateAction<PaymentMethodKey[]>>
  ) => {
    setter((prev) =>
      prev.includes(method)
        ? prev.filter((item) => item !== method)
        : [...prev, method]
    );
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newHolder.username.trim()) {
      customAlert("Username is required.");
      return;
    }

    if (!newHolder.password.trim()) {
      customAlert("Password is required.");
      return;
    }

    if (newHolderMethods.length === 0) {
      customAlert("Select at least one payment method.");
      return;
    }

    setIsCreating(true);
    addLoader();
    try {
      const response = await fetch("/api/admin/manage-account-holders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newHolder.username.trim(),
          password: newHolder.password,
          paymentMethods: newHolderMethods,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        customAlert(data.message ?? "Account holder created.", true, true);
        setNewHolder({ username: "", password: "" });
        setNewHolderMethods([]);
        await fetchAccountHolders();
      } else {
        customAlert(data.message || "Failed to create account holder.");
      }
    } catch (error) {
      customAlert("Error creating account holder.");
    } finally {
      setIsCreating(false);
      removeLoader();
    }
  };

  const startEditing = (holder: AccountHolder) => {
    setEditingId(holder.id);
    setEditingMethods(holder.allowed_methods ?? []);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingMethods([]);
    setUpdatingId(null);
  };

  const handleSaveMethods = async () => {
    if (editingId === null) return;

    setUpdatingId(editingId);
    addLoader();
    try {
      const response = await fetch("/api/admin/manage-account-holders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: editingId, paymentMethods: editingMethods }),
      });

      const data = await response.json();
      if (response.ok) {
        customAlert(data.message ?? "Payment methods updated.", true, true);
        cancelEditing();
        await fetchAccountHolders();
      } else {
        customAlert(data.message || "Failed to update payment methods.");
      }
    } catch (error) {
      customAlert("Error updating payment methods.");
    } finally {
      removeLoader();
      setUpdatingId(null);
    }
  };

  return (
    <section className={styles.dashboard} style={ubuntu.style}>
      <header className={styles.header}>
        <h1 style={title.style}>Manage Account Holders</h1>
        <p>
          Gate specific payment flows by issuing unique usernames and mapping
          them to the payment channels they can capture. Create accounts for new
          staff and tune their permissions in-place.
        </p>
      </header>

      <div className={styles.panels}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Create Account Holder</h2>
          <form className={styles.formGrid} onSubmit={handleCreate}>
            <div className={styles.inputRow}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                value={newHolder.username}
                onChange={(event) =>
                  setNewHolder((prev) => ({
                    ...prev,
                    username: event.target.value,
                  }))
                }
                placeholder="e.g. cashier.north"
                autoComplete="off"
                required
              />
            </div>
            <div className={styles.inputRow}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={newHolder.password}
                onChange={(event) =>
                  setNewHolder((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="A secure password"
                required
              />
            </div>

            <div className={styles.inputRow}>
              <label>Allowed payment methods</label>
              <MethodSelector
                selected={newHolderMethods}
                onToggle={(method) =>
                  toggleSelection(method, setNewHolderMethods)
                }
                methods={paymentMethods}
              />
            </div>

            <div className={styles.actionsRow}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isCreating}
              >
                {isCreating ? "Saving..." : "Create"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setNewHolder({ username: "", password: "" });
                  setNewHolderMethods([]);
                }}
                disabled={isCreating}
              >
                Reset
              </button>
            </div>
          </form>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Quick Tips</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.6 }}>
            <li>
              Assign at least one method so the user can see payment forms.
            </li>
            <li>
              Stick to clear naming (e.g., region, shift) to link deposits back
              to people.
            </li>
            <li>
              Tapping a red card removes it; dotted cards can be activated via
              the + icon.
            </li>
          </ul>
        </article>
      </div>

      <section className={styles.listSection}>
        <h2 className={styles.panelTitle}>Current Access</h2>
        <div className={styles.holdersGrid}>
          {accountHolders.length === 0 ? (
            <div className={styles.emptyState}>
              No account holders yet. Create one to get started.
            </div>
          ) : (
            accountHolders.map((holder) => {
              const isEditing = editingId === holder.id;
              return (
                <div key={holder.id} className={styles.holderCard}>
                  <div className={styles.holderHeader}>
                    <div>
                      <p className={styles.username}>{holder.username}</p>
                      {!isEditing && (
                        <div className={styles.holderMethods}>
                          {holder.allowed_methods.length > 0 ? (
                            holder.allowed_methods.map((method) => (
                              <span key={method} className={styles.methodPill}>
                                {method}
                              </span>
                            ))
                          ) : (
                            <span className={styles.methodMeta}>
                              No methods assigned
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isEditing ? (
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => startEditing(holder)}
                      >
                        Edit Methods
                      </button>
                    ) : null}
                  </div>

                  {isEditing && (
                    <>
                      <MethodSelector
                        selected={editingMethods}
                        onToggle={(method) =>
                          toggleSelection(method, setEditingMethods)
                        }
                        methods={paymentMethods}
                        disabled={updatingId === holder.id}
                      />

                      <div className={styles.actionsRow}>
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={handleSaveMethods}
                          disabled={updatingId === holder.id}
                        >
                          {updatingId === holder.id ? "Saving..." : "OK"}
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={cancelEditing}
                          disabled={updatingId === holder.id}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </section>
  );
}
