'use client';

const cards = [
  {
    emoji: '🔒',
    title: 'Veri Güvenliği',
    desc: 'Verileriniz şifreli sunucularda saklanır, asla üçüncü taraflarla paylaşılmaz.',
  },
  {
    emoji: '⚡',
    title: 'Anlık Hesaplama',
    desc: 'Tüm maliyet kalemleri saniyeler içinde hesaplanır, manuel işlem gerekmez.',
  },
  {
    emoji: '🎯',
    title: 'Gerçek Veriler',
    desc: 'Komisyon, kargo ve KDV oranları güncel pazaryeri verilerine göre hesaplanır.',
  },
  {
    emoji: '💳',
    title: 'Kolay Başlangıç',
    desc: 'Kredi kartı gerekmez. 5 dakikada hesap aç, hemen analiz yapmaya başla.',
  },
];

export function TrustTech() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#FBBF24' }}>
            Altyapı
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" style={{ letterSpacing: '-0.5px' }}>
            Güvenli ve Güvenilir Altyapı
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] text-base max-w-2xl mx-auto">
            Verileriniz güvende, hesaplamalarınız doğru
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-6 hover:border-amber-500/20 hover:shadow-md transition-all duration-300"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/12 bg-amber-500/8 text-2xl mb-4">
                {card.emoji}
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
                {card.title}
              </h3>
              <p className="text-xs md:text-sm text-[rgba(255,255,255,0.5)] leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
