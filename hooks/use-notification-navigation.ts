'use client';

import { useRouter } from 'next/navigation';
import { Notification } from '@/types';
import { toast } from 'sonner';

export function useNotificationNavigation() {
    const router = useRouter();

    const markAsRead = async (id: string) => {
        await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    };

    const navigate = async (notification: Notification) => {
        try {
            // Mark as read immediately when clicked
            if (!notification.is_read) {
                await markAsRead(notification.id);
            }

            // Determine target href
            let targetHref = notification.href;

            if (!targetHref) {
                if (notification.analysis_id) {
                    targetHref = `/analysis/${notification.analysis_id}`;
                } else if (notification.product_id) {
                    targetHref = `/products/${notification.product_id}`;
                }
            }

            // Fallback navigation for bulk/csv if category matches
            if (!targetHref && notification.category === 'bulk') {
                targetHref = '/products';
            }

            if (targetHref) {
                router.push(targetHref);
            } else {
                toast.error('Kayıt bulunamadı', {
                    description: 'İlgili analiz veya ürün detayına ulaşılamıyor.',
                });
            }
        } catch {
            toast.error('Gezinme hatası oluştu.');
        }
    };

    return { navigate };
}
