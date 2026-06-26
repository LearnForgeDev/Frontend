import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import './CertPage.css';

const CertPage = () => {
  const [showPopup, setShowPopup] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box className="cert-body-full">
      <Box
        className="how-print no-print"
        onClick={() => setShowPopup(true)}
        role="button"
        tabIndex={0}
        aria-label="Инструкция по печати"
        style={{ cursor: 'pointer' }}
      >
        <Typography>Инструкция по печати</Typography>
      </Box>

      <Box className="container-cert-full">
        <Box className="cert-top-block-full">
          <Box className="qr-cert-info-full">
            <Box
              component="img"
              src="https://raw.githubusercontent.com/MoscowMoscovv/challenge.braim.org/refs/heads/main/img.jpg"
              alt="QR Code"
              className="qr-cert-full"
            />
            <Typography className="cert-number">12.03.2026</Typography>
          </Box>
          <Box
            component="img"
            src="https://challenge.braim.org/storage/certificate/53234/challenge/647/certificate/a0cd9029-1dd2-11f1-aab0-8b7c20fcdc9d.jpg"
            alt="Certificate background"
            className="cert-image-main-full"
          />
          <Typography variant="h6" className="cert-sheet-heading">Сертификат</Typography>
          <Typography className="cert-challenge-name-full">Прикладное программирование if...else</Typography>
          <Box className="cert-top-block-info-full">
            <Typography className="cert-text-info-full">подтверждает, что</Typography>
            <Typography className="cert-top-block-name-full">Тарасенко Ян Владиславович</Typography>
            <Typography className="cert-text-bottom-full">
              участвовал(а) в первом отборочном этапе Международной олимпиады «IT-Планета 2026» в конкурсе компании BRAIM, выполнив задание на 76.7% из 100%. Испытание успешно пройдено — участник допущен ко второму отборочному этапу Олимпиады.
            </Typography>
          </Box>
        </Box>
        <Box className="cert-bottom-block-full">
          <Box className="podpisant-info-full">
            <Typography className="cert-text-signatory-full">Шалашный Сергей Игоревич</Typography>
            <Typography className="cert-text-jobtitle-full">Председатель АНО ЦРИТ «ИТ-Планета»</Typography>
          </Box>
          <Box className="about-braim-full">
            <Box className="logo-braim-cert-full">
              <Box
                component="img"
                src="https://challenge.braim.org/images/logo_plat.svg"
                alt="Braim Logo"
              />
              <Typography className="about-braim-text-full">Создано на braim.org</Typography>
            </Box>
            <Box
              component="img"
              src="https://challenge.braim.org/storage/certificate/53234/challenge/647/certificate/0df019cf-1dd3-11f1-aab0-7b2148c35852.png"
              alt="Logo"
              className="logo-cert-full"
            />
          </Box>
          <Box
            component="img"
            src="https://challenge.braim.org/storage/certificate/53234/challenge/647/certificate/a0cec8aa-1dd2-11f1-aab0-b5e7ca046844.png"
            alt="Signature"
            className="podpis-full"
          />
          <Box
            component="img"
            src="https://challenge.braim.org/storage/certificate/53234/challenge/647/certificate/a0cb1f28-1dd2-11f1-aab0-7f9edd98e3c3.png"
            alt="Stamp"
            className="pechat-full"
          />
        </Box>
      </Box>

      {showPopup && (
        <Box
          className="how-print-popup no-print"
          onClick={() => setShowPopup(false)}
        >
          <Box
            className="how-print-block-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              className="close-window"
              onClick={() => setShowPopup(false)}
              role="button"
              tabIndex={0}
              aria-label="Закрыть"
            />
            <Box className="how-print-info-text">
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Инструкция по сохранению и печати
              </Typography>
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                1. Откройте диалоговое окно печати (сочетание клавиш <strong>Ctrl + P</strong> или <strong>Cmd + P</strong> на Mac).
              </Typography>
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                2. Установите ориентацию страницы: <strong>Альбомная</strong> (Landscape).
              </Typography>
              <Typography sx={{ mb: 1, textAlign: 'left' }}>
                3. Включите отображение фонов: <strong>Фоновые рисунки</strong> / фоновая графика (Background graphics).
              </Typography>
              <Typography sx={{ mb: 3, textAlign: 'left' }}>
                4. Отключите верхние и нижние колонтитулы (Headers and footers).
              </Typography>
              <Box
                className="how-print"
                onClick={handlePrint}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'inline-block',
                  mt: 2,
                  bottom: 'auto',
                  left: 'auto'
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>Печать</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CertPage;
