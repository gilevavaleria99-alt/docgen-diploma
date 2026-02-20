import React from 'react';
import Joyride, { STATUS } from 'react-joyride';

export default function GuidedTour({ run, setRun }) {
  const steps = [
    {
      target: '.tour-toolbar',
      content: 'Панель инструментов: используйте этот блок для формирования структуры документа. Вы можете добавлять текстовые абзацы, многоуровневые заголовки, списки и изображения.',
      placement: 'right', // Окно будет справа от панели, не перекрывая кнопки
      disableBeacon: true,
    },
    {
      target: '.tour-workspace',
      content: 'Рабочая область: здесь отображается визуальная модель вашего отчета. Вы можете редактировать контент в реальном времени, менять порядок блоков или удалять их.',
      placement: 'bottom',
    },
    {
      target: '.tour-metadata',
      content: 'Метаданные титульного листа: заполните сведения об авторе, дисциплине и теме. Система автоматически интегрирует эти данные в шаблон документа.',
      placement: 'left', // Окно будет слева от формы
    },
    {
      target: '.tour-download',
      content: 'Экспорт документа: по завершении редактирования нажмите здесь для генерации итогового файла в формате .docx, оформленного строго по стандартам ГОСТ.',
      placement: 'bottom',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={false} // Уберем (1/4), это выглядит дешево
      showSkipButton={false}
      // Настройка внешнего вида (Стилизация)
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.4)', // Сделаем затемнение чуть мягче
          primaryColor: '#9F2BC2', // Твой фирменный фиолетовый
          textColor: '#1E1E20', // Темный цвет текста как в приложении
          width: 350,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 20, // Скругление как у твоих блоков
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
          fontFamily: 'sans-serif',
        },
        tooltipTitle: {
          margin: 0,
        },
        tooltipContent: {
          padding: '10px 0',
          fontSize: '15px',
          lineHeight: '1.5',
        },
        buttonNext: {
          backgroundColor: '#9F2BC2',
          borderRadius: 100, // Овальная кнопка
          padding: '10px 25px',
          fontSize: '14px',
          fontWeight: 'bold',
          outline: 'none',
        },
        buttonBack: {
          marginRight: 10,
          color: '#666',
          fontSize: '14px',
        },
      }}
      // Перевод кнопок на русский
      locale={{
        back: 'Назад',
        close: 'Завершить',
        last: 'Понятно',
        next: 'Далее',
        skip: 'Пропустить обучение',
      }}
      callback={(data) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
          setRun(false);
        }
      }}
    />
  );
}