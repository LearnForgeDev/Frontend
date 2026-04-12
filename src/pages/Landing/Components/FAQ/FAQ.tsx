import { useCallback, useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import './FAQ.css';

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
    <Box component="section" className="faq-section" id="faq" aria-labelledby="faq-heading">
      <Box className="faq-container">
        <Box component="header" className="faq-header">
          <Box component="span" className="section-kicker">FAQ</Box>
          <Typography component="h2" id="faq-heading">Ответы на популярные вопросы</Typography>
        </Box>
        <Box className="faq-list" role="list">
          {faqData.map((item) => {
            const isOpen = openItems.has(item.id);
            const questionId = `faq-question-${item.id}`;
            const answerId = `faq-answer-${item.id}`;
            return (
              <Box
                key={item.id}
                className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}
                role="listitem"
              >
                <ButtonBase
                  className="faq-question"
                  onClick={() => toggleItem(item.id)}
                  id={questionId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <Box className="faq-question-text">
                    <Typography component="span">{item.question}</Typography>
                  </Box>
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
                </ButtonBase>
                <Box
                  id={answerId}
                  className="faq-answer"
                  role="region"
                  aria-hidden={!isOpen}
                  aria-labelledby={questionId}
                >
                  <Typography component="p">{item.answer}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
