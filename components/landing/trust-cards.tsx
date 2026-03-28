'use client';

import { Shield, Zap, Target, CreditCard } from 'lucide-react';

export function TrustCards() {
  const cards = [
    {
      icon: Shield,
      title: "Veri Güvenliği",
      desc: "Verileriniz şifreli sunucularda saklanır, asla üçüncü taraflarla paylaşılmaz."
    },
    {
      icon: Zap,
      title: "Anlık Hesaplama",
      desc: "Tüm maliyet kalemleri saniyeler içinde hesaplanır, manuel işlem gerekmez."
    },
    {
      icon: Target,
      title: "Gerçek Veriler",
      desc: "Komisyon, kargo ve KDV oranları güncel pazaryeri verilerine göre hesaplanır."
    },
    {
      icon: CreditCard,
      title: "Kolay Başlangıç",
      desc: "Kredi kartı gerekmez. 5 dakikada hesap aç, hemen analiz yapmaya başla."
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ letterSpacing: '-0.5px' }}>Güvenli ve Güvenilir Altyapı</h2>
          <p className="text-[rgba(255,255,255,0.5)]">Verileriniz güvende, hesaplamalarınız doğru</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-6 border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] hover:border-amber-500/20 hover:shadow-md transition-all duration-300 flex flex-col items-start text-left"
            >
              <div className="bg-amber-500/8 border border-amber-500/12 text-amber-400 p-3 rounded-xl mb-4">
                <card.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{card.title}</h3>
              <p className="text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
