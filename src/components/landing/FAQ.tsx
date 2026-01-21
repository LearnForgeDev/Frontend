import { useCallback, useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 'formats',
    question: 'Живые уроки или записи?',
    answer:
      'Поддерживаем оба формата: ведите live-сессии с чатом, а записи сохраняем автоматически, чтобы ученики смотрели в удобное время.',
  },
  {
    id: 'tests',
    question: 'Как работают тесты и проверки?',
    answer:
      'Есть вопросы с выбором, вводом текста и сопоставлением. Автопроверка мгновенно подсвечивает результаты и показывает прогресс.',
  },
  {
    id: 'payments',
    question: 'Оплата и доступ к курсам?',
    answer:
      'Принимаем разовые платежи и подписки. После оплаты курс появляется в личном кабинете, доступ можно ограничить по времени.',
  },
  {
    id: 'support',
    question: 'Что с поддержкой и онбордингом?',
    answer:
      '24/7 чат и email. Поможем перенести контент и настроить расписание — без сложных интеграций.',
  },
  {
    id: 'mobile',
    question: 'Адаптация под мобильные?',
    answer:
      'Интерфейс полностью адаптивный: уроки, тесты, чат и оплата корректно работают на телефонах и планшетах.',
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set());

  const toggleItem = useCallback((id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="faq-container">
        <header className="faq-header">
          <span className="section-kicker">FAQ</span>
          <h2 id="faq-heading">Ответы на популярные вопросы</h2>
        </header>
        <div className="faq-list" role="list">
          {faqData.map((item) => {
            const isOpen = openItems.has(item.id);
            const questionId = `faq-question-${item.id}`;
            const answerId = `faq-answer-${item.id}`;
            return (
              <div
                key={item.id}
                className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
                role="listitem"
              >
                <button
                  className="faq-question"
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  id={questionId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <div className="faq-question-text">
                    <span>{item.question}</span>
                  </div>
                  <svg
                    className="faq-chevron"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  id={answerId}
                  className="faq-answer"
                  role="region"
                  aria-hidden={!isOpen}
                  aria-labelledby={questionId}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
