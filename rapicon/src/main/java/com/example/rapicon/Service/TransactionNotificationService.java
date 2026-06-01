package com.example.rapicon.Service;

import com.example.rapicon.DTO.NotificationRequest;
import com.example.rapicon.Enum.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionNotificationService {

    private final NotificationService notificationService;

    // ─── Payment success ──────────────────────────────────────────────
    public void notifyPaymentSuccess(Long userId, String paymentId, BigDecimal amount) {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(userId);
        req.setTitle("Payment successful");
        req.setBody(String.format("Rs %.0f paid successfully. Ref: %s", amount, paymentId));
        req.setType(NotificationType.PAYMENT_SUCCESS);
        req.setEntityId(paymentId);
        req.setChannelId("default");
        req.setSilent(false);

        notificationService.sendToUser(req);
        log.info("Payment success notification sent. userId={}, paymentId={}", userId, paymentId);
    }

    // ─── Payment failed ───────────────────────────────────────────────
    public void notifyPaymentFailed(Long userId, String paymentId, String reason) {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(userId);
        req.setTitle("Payment failed");
        req.setBody(String.format("Your payment could not be processed. %s", reason));
        req.setType(NotificationType.PAYMENT_FAILED);
        req.setEntityId(paymentId);
        req.setChannelId("default");
        req.setSilent(false);

        notificationService.sendToUser(req);
        log.info("Payment failed notification sent. userId={}, paymentId={}", userId, paymentId);
    }

    // ─── Order placed (notify vendor) ────────────────────────────────
    public void notifyOrderPlaced(Long userId, String orderId) {
        // 1. Notify the customer
        NotificationRequest userReq = new NotificationRequest();
        userReq.setUserId(userId);
        userReq.setTitle("Order placed successfully!");
        userReq.setBody(String.format("Your order #%s has been placed. Waiting for confirmation.", orderId));
        userReq.setType(NotificationType.ORDER_PLACED);
        userReq.setEntityId(orderId);
        userReq.setChannelId("orders");
        userReq.setSilent(false);
        notificationService.sendToUser(userReq);

        // 2. Notify the vendor
//        NotificationRequest vendorReq = new NotificationRequest();
//        vendorReq.setUserId(vendorId);
//        vendorReq.setTitle("New order received!");
//        vendorReq.setBody(String.format("You have a new order #%s. Please review and confirm.", orderId));
//        vendorReq.setType(NotificationType.ORDER_PLACED);
//        vendorReq.setEntityId(orderId);
//        vendorReq.setChannelId("orders");
//        vendorReq.setSilent(false);
//        notificationService.sendToUser(vendorReq);
//
//        log.info("Order placed notifications sent. orderId={}", orderId);
    }

    // ─── Order accepted (vendor accepts → notify user) ────────────────
    public void notifyOrderAccepted(Long userId, String orderId, String vendorName) {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(userId);
        req.setTitle("Order confirmed!");
        req.setBody(String.format("%s has accepted your order #%s.", vendorName, orderId));
        req.setType(NotificationType.ORDER_ACCEPTED);
        req.setEntityId(orderId);
        req.setChannelId("orders");
        req.setSilent(false);

        notificationService.sendToUser(req);
        log.info("Order accepted notification sent. userId={}, orderId={}", userId, orderId);
    }

    // ─── Order rejected (vendor rejects → notify user) ────────────────
    public void notifyOrderRejected(Long userId, String orderId, String reason) {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(userId);
        req.setTitle("Order rejected");
        req.setBody(String.format("Your order #%s was rejected. Reason: %s", orderId, reason));
        req.setType(NotificationType.ORDER_REJECTED);
        req.setEntityId(orderId);
        req.setChannelId("orders");
        req.setSilent(false);

        notificationService.sendToUser(req);
        log.info("Order rejected notification sent. userId={}, orderId={}", userId, orderId);
    }

    // ─── Order completed ──────────────────────────────────────────────
    public void notifyOrderCompleted(Long userId, String orderId) {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(userId);
        req.setTitle("Order completed!");
        req.setBody(String.format("Your order #%s has been delivered. Thank you!", orderId));
        req.setType(NotificationType.ORDER_COMPLETED);
        req.setEntityId(orderId);
        req.setChannelId("orders");
        req.setSilent(false);

        notificationService.sendToUser(req);
        log.info("Order completed notification sent. userId={}, orderId={}", userId, orderId);
    }

    // ─── Refund initiated ─────────────────────────────────────────────
    public void notifyRefundInitiated(Long userId, String orderId, double amount) {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(userId);
        req.setTitle("Refund initiated");
        req.setBody(String.format("Rs %.0f refund for order #%s is being processed.", amount, orderId));
        req.setType(NotificationType.REFUND_INITIATED);
        req.setEntityId(orderId);
        req.setChannelId("default");
        req.setSilent(false);

        notificationService.sendToUser(req);
        log.info("Refund initiated notification sent. userId={}, orderId={}", userId, orderId);
    }

    // ─── Refund success ───────────────────────────────────────────────
    public void notifyRefundSuccess(Long userId, String orderId, double amount) {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(userId);
        req.setTitle("Refund successful!");
        req.setBody(String.format("Rs %.0f has been refunded for order #%s.", amount, orderId));
        req.setType(NotificationType.REFUND_SUCCESS);
        req.setEntityId(orderId);
        req.setChannelId("default");
        req.setSilent(false);

        notificationService.sendToUser(req);
        log.info("Refund success notification sent. userId={}, orderId={}", userId, orderId);
    }
}
