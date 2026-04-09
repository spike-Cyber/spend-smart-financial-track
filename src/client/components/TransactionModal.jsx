import React from "react";
import { Modal } from "../visuals";

const categories = ["Salary", "Freelance", "Food", "Rent", "Transport", "Shopping", "Health", "Utilities", "Entertainment", "Investments"];

export function TransactionModal({ editingTransaction, transactionPreset, transactionFeedback, onClose, onSubmit }) {
  return (
    <Modal onClose={onClose}>
      <h3>{editingTransaction ? "Edit transaction" : "Add transaction"}</h3>
      <form onSubmit={onSubmit} className="field-grid">
        <input type="hidden" name="id" defaultValue={editingTransaction?.id || ""} />
        <label className="field full">
          <span>Title</span>
          <input name="title" defaultValue={editingTransaction?.title || ""} placeholder="Salary, groceries, rent..." required />
        </label>
        <label className="field">
          <span>Amount</span>
          <input name="amount" type="number" min="1" step="0.01" defaultValue={editingTransaction?.amount || ""} required />
        </label>
        <label className="field">
          <span>Date</span>
          <input name="date" type="date" defaultValue={editingTransaction?.date || new Date().toISOString().slice(0, 10)} required />
        </label>
        <label className="field">
          <span>Type</span>
          <select name="type" defaultValue={editingTransaction?.type || transactionPreset.type}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue={editingTransaction?.category || transactionPreset.category}>
            {categories.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="field full">
          <span>Notes</span>
          <textarea name="notes" rows="3" defaultValue={editingTransaction?.notes || ""} placeholder="Add context for this transaction" />
        </label>
        <div className="row-end full">
          <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">Save transaction</button>
        </div>
        <p className="feedback full">{transactionFeedback}</p>
      </form>
    </Modal>
  );
}
