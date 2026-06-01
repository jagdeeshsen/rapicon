package com.example.rapicon.Enum;

public enum NotificationType {
    ORDER,
    PAYMENT,
    OTP,
    PROMO,
    MESSAGE,
    LIKE,
    FOLLOW,
    ALERT,
    REMINDER,
    SILENT,

    // ─── ADD these transaction-specific types ──────────────────────
    PAYMENT_SUCCESS,
    PAYMENT_FAILED,
    ORDER_PLACED,
    ORDER_ACCEPTED,
    ORDER_REJECTED,
    ORDER_COMPLETED,
    REFUND_INITIATED,
    REFUND_SUCCESS
}
