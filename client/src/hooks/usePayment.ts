import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPaymentOrderRequest, verifyPaymentRequest } from '@/lib/payment';
import { loadRazorpayCheckout } from '@/lib/razorpayCheckout';

export function usePayContribution(circleId: string, cycleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const order = await createPaymentOrderRequest(circleId, cycleId);
      await loadRazorpayCheckout();

      await new Promise<void>((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error('Payment SDK unavailable'));
          return;
        }
        const checkout = new window.Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: 'TrustLoop',
          description: 'Circle contribution',
          theme: { color: '#0e6e63' },
          handler: (response) => {
            verifyPaymentRequest(circleId, cycleId, response)
              .then(() => resolve())
              .catch(reject);
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        });
        checkout.open();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'cycles'] });
      queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['circles', circleId, 'members'] });
    },
  });
}
