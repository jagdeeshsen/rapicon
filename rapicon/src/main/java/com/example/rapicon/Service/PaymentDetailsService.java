package com.example.rapicon.Service;

import com.example.rapicon.DTO.PaymentDetailDTO;
import com.example.rapicon.Models.Installments;
import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.PaymentDetails;
import com.example.rapicon.Repository.OrderRepo;
import com.example.rapicon.Repository.PaymentDetailsRepo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentDetailsService {

    private final PaymentDetailsRepo paymentDetailsRepo;
    private final OrderRepo orderRepo;
    private final OrderService orderService;
    private final TransactionNotificationService transactionNotificationService;

    public PaymentDetails createPayment(boolean firstPayment, Map<String, Object> paymentData){
        ObjectMapper mapper= new ObjectMapper();
        Long Id = Long.parseLong(paymentData.get("orderId").toString());
        String merchantOrderId = (String) paymentData.get("merchantOrderId");
        String phonePeOrderId = (String) paymentData.get("phonePeOrderId");
        String paymentState = (String) paymentData.get("paymentState");
        Long amount = ((Number) paymentData.get("amount")).longValue();

        List<PaymentDetailDTO> paymentDetailList =
                mapper.convertValue(paymentData.get("paymentDetails"),
                        new TypeReference<List<PaymentDetailDTO>>() {});

        // 1. Check if order exists
        Order order = orderService.getOrderById(Id);

        // 2. Verify amount matches
        BigDecimal savedAmount=new BigDecimal(0);
        if(firstPayment && order.getTotalInstallments()==1){
            savedAmount = order.getTotalAmount();
        }else{
            savedAmount = order.getInstallmentAmount();
        }

        BigDecimal amountInPaisa= savedAmount.multiply(new BigDecimal(100));
        System.out.println("saved Amount: "+ savedAmount+ ","+ "amount: "+ amountInPaisa);
        if (amountInPaisa.compareTo(new BigDecimal(amount))!=0) {
            throw new RuntimeException("Amount mismatch");
        }else{
            BigDecimal paidAmount = new BigDecimal(0);
            if(!firstPayment){
                paidAmount= order.getPaidAmount();
                paidAmount = paidAmount.add(savedAmount);
            }else{
                paidAmount= savedAmount;
            }
            order.setPaidAmount(paidAmount);
        }

        // check if all installments are paid
        if(order.getPaidAmount().compareTo(order.getTotalAmount()) == 0) {
            order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
        }

        order.setOrderStatus(Order.OrderStatus.COMPLETED);

        PaymentDetailDTO details= paymentDetailList.get(0);

        PaymentDetails pd= new PaymentDetails();
        pd.setOrderId(Id);
        pd.setPhonePeOrderId(phonePeOrderId);
        pd.setAmount(details.getAmount().divide(new BigDecimal(100)));
        pd.setPaymentMode(details.getPaymentMode());
        pd.setState(details.getState());
        pd.setTransactionId(details.getTransactionId());
        pd.setFeeAmount(details.getFeeAmount());
        pd.setPayableAmount(details.getPayableAmount().divide(new BigDecimal(100)));
        pd.setCreatedAt(details.getTimestamp());


        // update installment
        List<Installments> installmentsList= order.getInstallmentsList();
        installmentsList.sort(
                Comparator.comparingInt(Installments::getInstallmentNumber)
        );


        for(Installments installments: installmentsList){
            if(installments.isUnlocked() && installments.getInstallmentStatus() != Installments.InstallmentStatus.PAID){
                installments.setInstallmentStatus(Installments.InstallmentStatus.PAID);
                installments.setPaidDate(LocalDateTime.now());
                installments.setUpdatedAt(LocalDateTime.now());
                continue;
            }

            if(!installments.isUnlocked() && installments.getInstallmentStatus()== Installments.InstallmentStatus.PENDING){
                installments.setUnlocked(true);
                installments.setUnlockedAt(LocalDateTime.now());
                installments.setUpdatedAt(LocalDateTime.now());
                break;
            }
        }

        PaymentDetails savedPaymentDetails = paymentDetailsRepo.save(pd);
        // send notification to user
        transactionNotificationService.notifyPaymentSuccess(order.getUserId(), savedPaymentDetails.getId().toString(), savedAmount);

        orderService.updateOrder(order);

        // 4. Send confirmation notification
        if(firstPayment) {
            transactionNotificationService.notifyOrderPlaced(order.getUserId(), order.getId().toString());
        }
        return pd;
    }

    public PaymentDetails updatePayment(PaymentDetails paymentDetails){
        return paymentDetailsRepo.save(paymentDetails);
    }

    public void deleteByUserId(Long userId){
        List<Long> orderIds = orderRepo.findIdsByUserId(userId);
        paymentDetailsRepo.deleteByOrderIds(orderIds);
    }
}
