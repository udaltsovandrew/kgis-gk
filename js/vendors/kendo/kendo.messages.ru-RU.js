(function ($, undefined) {
  /* Filter menu operator messages */

  if (kendo.ui.FilterCell) {
    kendo.ui.FilterCell.prototype.options.operators =
      $.extend(true, kendo.ui.FilterCell.prototype.options.operators,{
        "date": {
          "eq": "равна",
          "gte": "после или равна",
          "gt": "после",
          "lte": "до или равна",
          "lt": "до",
          "neq": "не равна"
        },
        "number": {
          "eq": "равно",
          "gte": "больше или равно",
          "gt": "больше",
          "lte": "меньше или равно",
          "lt": "меньше",
          "neq": "не равно"
        },
        "string": {
          "endswith": "оканчивается на",
          "eq": "равно",
          "neq": "не равно",
          "startswith": "начинается на",
          "contains": "содержит",
          "doesnotcontain": "не содержит"
        },
        "enums": {
          "eq": "равно",
          "neq": "не равно"
        }
      });
  }

  /* Filter menu operator messages */

  if (kendo.ui.FilterMenu) {
    kendo.ui.FilterMenu.prototype.options.operators =
      $.extend(true, kendo.ui.FilterMenu.prototype.options.operators,{
        "date": {
          "eq": "равна",
          "gte": "после или равна",
          "gt": "после",
          "lte": "до или равна",
          "lt": "до",
          "neq": "не равна"
        },
        "number": {
          "eq": "равно",
          "gte": "больше или равно",
          "gt": "больше",
          "lte": "меньше или равно",
          "lt": "меньше",
          "neq": "не равно"
        },
        "string": {
          "endswith": "оканчивается на",
          "eq": "равно",
          "neq": "не равно",
          "startswith": "начинается на",
          "contains": "содержит",
          "doesnotcontain": "не содержит"
        },
        "enums": {
          "eq": "равно",
          "neq": "не равно"
        }
      });
  }

  /* ColumnMenu messages */

  if (kendo.ui.ColumnMenu) {
    kendo.ui.ColumnMenu.prototype.options.messages =
      $.extend(true, kendo.ui.ColumnMenu.prototype.options.messages,{
        "columns": "Столбцы",
        "sortAscending": "Сортировка по возрастанию",
        "sortDescending": "Сортировка по убыванию",
        "settings": "Параметры столбцов",
        "done": "Готово",
        "lock": "Заблокировать",
        "unlock": "Разблокировать",
        "filter": "Фильтровать"
      });
  }

  /* RecurrenceEditor messages */

  if (kendo.ui.RecurrenceEditor) {
    kendo.ui.RecurrenceEditor.prototype.options.messages =
      $.extend(true, kendo.ui.RecurrenceEditor.prototype.options.messages,{
        "daily": {
          "interval": "день (дня, дней)",
          "repeatEvery": "Повторять каждый (ые):"
        },
        "end": {
          "after": "После",
          "occurrence": "повторения (ий)",
          "label": "Закончить:",
          "never": "Никогда",
          "on": "Дата",
          "mobileLabel": "Окончание"
        },
        "frequencies": {
          "daily": "Ежедневно",
          "monthly": "Ежемесячно",
          "never": "Никогда",
          "weekly": "Еженедельно",
          "yearly": "Ежегодно"
        },
        "monthly": {
          "day": "День",
          "interval": "месяц (ев)",
          "repeatEvery": "Повторять каждый (ые):",
          "repeatOn": "Повторить:"
        },
        "offsetPositions": {
          "first": "первый",
          "fourth": "четвертый",
          "last": "последний",
          "second": "второй",
          "third": "третий"
        },
        "weekly": {
          "repeatEvery": "Повторять каждую (ые):",
          "repeatOn": "Повторить:",
          "interval": "неделю (и)"
        },
        "yearly": {
          "of": "",
          "repeatEvery": "Повторять каждый (ые):",
          "repeatOn": "Повторить:",
          "interval": "год (а)(лет)"
        },
        "weekdays": {
          "day": "день",
          "weekday": "будний день",
          "weekend": "выходной"
        }
      });
  }

  /* Grid messages */

  if (kendo.ui.Grid) {
    kendo.ui.Grid.prototype.options.messages =
      $.extend(true, kendo.ui.Grid.prototype.options.messages,{
        "commands": {
          "create": "Добавить",
          "destroy": "Удалить",
          "canceledit": "Отмена",
          "update": "Обновить",
          "edit": "Изменить",
          "excel": "Экспорт в Excel",
          "pdf": "Экспорт в PDF",
          "select": "Выбрать",
          "cancel": "Отменить изменения",
          "save": "Сохранить изменения"
        },
        "editable": {
          "confirmation": "Вы уверены, что хотите удалить эту запись?",
          "cancelDelete": "Отмена",
          "confirmDelete": "Удалить"
        },
        "noRecords": "Нет записей"
      });
  }

  /* Pager messages */

  if (kendo.ui.Pager) {
    kendo.ui.Pager.prototype.options.messages =
      $.extend(true, kendo.ui.Pager.prototype.options.messages,{
        "allPages": "Все",
        "page": "Страница",
        "display": "Отображены записи {0} - {1} из {2}",
        "of": "из {0}",
        "empty": "Нет записей для отображения",
        "refresh": "Обновить",
        "first": "Вернуться на первую страницу",
        "itemsPerPage": "элементов на странице",
        "last": "К последней странице",
        "next": "Перейдите на следующую страницу",
        "previous": "Перейти на предыдущую страницу",
        "morePages": "Больше страниц"
      });
  }

  /* FilterCell messages */

  if (kendo.ui.FilterCell) {
    kendo.ui.FilterCell.prototype.options.messages =
      $.extend(true, kendo.ui.FilterCell.prototype.options.messages,{
        "filter": "Фильтровать",
        "clear": "Очистить",
        "isFalse": "Ложь",
        "isTrue": "Истина",
        "operator": "Оператор"
      });
  }

  /* FilterMenu messages */

  if (kendo.ui.FilterMenu) {
    kendo.ui.FilterMenu.prototype.options.messages =
      $.extend(true, kendo.ui.FilterMenu.prototype.options.messages,{
        "filter": "Фильтровать",
        "and": "И",
        "clear": "Очистить",
        "info": "Строки со значениями",
        "selectValue": "-выберите-",
        "isFalse": "Ложь",
        "isTrue": "Истина",
        "or": "ИЛИ",
        "cancel": "Отмена",
        "operator": "Оператор",
        "value": "Значение"
      });
  }

  /* FilterMultiCheck messages */

  if (kendo.ui.FilterMultiCheck) {
    kendo.ui.FilterMultiCheck.prototype.options.messages =
      $.extend(true, kendo.ui.FilterMultiCheck.prototype.options.messages,{
        "search": "Поиск"
      });
  }

  /* Groupable messages */

  if (kendo.ui.Groupable) {
    kendo.ui.Groupable.prototype.options.messages =
      $.extend(true, kendo.ui.Groupable.prototype.options.messages,{
        "empty": "Переместите сюда заголовок столбца, чтобы сгрупировать записи из этого столбца"
      });
  }

  /* Editor messages */

  if (kendo.ui.Editor) {
    kendo.ui.Editor.prototype.options.messages =
      $.extend(true, kendo.ui.Editor.prototype.options.messages,{
        "bold": "Полужирный",
        "createLink": "Вставить гиперссылку",
        "fontName": "Шрифт",
        "fontNameInherit": "(шрифт как в документе)",
        "fontSize": "Выбрать размер шрифта",
        "fontSizeInherit": "(размер как в документе)",
        "formatBlock": "Формат",
        "indent": "Увеличить отступ",
        "insertHtml": "Вставить HTML",
        "insertImage": "Изображение",
        "insertOrderedList": "Нумерованный список",
        "insertUnorderedList": "Маркированныйсписок",
        "italic": "Курсив",
        "justifyCenter": "По центру",
        "justifyFull": "По ширине",
        "justifyLeft": "Влево",
        "justifyRight": "Вправо",
        "outdent": "Уменьшить отступ",
        "strikethrough": "Зачеркнутый",
        "styles": "Стиль",
        "subscript": "Под строкой",
        "superscript": "Над строкой",
        "underline": "Подчеркнутый",
        "unlink": "Удалить гиперссылку",
        "dialogButtonSeparator": "или",
        "dialogCancel": "Отмена",
        "dialogInsert": "Вставить",
        "imageAltText": "Альтернативный текст",
        "imageWebAddress": "Веб адрес",
        "linkOpenInNewWindow": "Открыть в новом окне",
        "linkText": "Текст",
        "linkToolTip": "Всплывающая подсказка",
        "linkWebAddress": "Веб адрес",
        "search": "Поиск",
        "createTable": "Вставить таблицу",
        "addColumnLeft": "Вставить столбец слева",
        "addColumnRight": "Вставить столбец справа",
        "addRowAbove": "Вставить строку сверху",
        "addRowBelow": "Вставить строку снизу",
        "deleteColumn": "Удалить столбец",
        "deleteRow": "Удалить строку",
        "backColor": "Цвет фона",
        "deleteFile": "Вы уверены, что хотите удалить \"{0}\"?",
        "directoryNotFound": "Папка не найдена",
        "dropFilesHere": "перетащите сюда файлы для загрузки",
        "emptyFolder": "Пустая папка",
        "foreColor": "Цвет",
        "invalidFileType": "Файл \"{0}\" имеет недопустимый фомат. Поддерживаемым является формат {1}.",
        "orderBy": "Упорядочить по:",
        "orderByName": "Имя",
        "orderBySize": "Размер",
        "overwriteFile": "Файл \"{0}\" уже существует. Заменить?",
        "uploadFile": "Загрузить",
        "formatting": "Форматирование",
        "viewHtml": "Посмотреть HTML",
        "dialogUpdate": "Обновить",
        "insertFile": "Вставить файл"
      });
  }

  /* Upload messages */

  if (kendo.ui.Upload) {
    kendo.ui.Upload.prototype.options.localization =
      $.extend(true, kendo.ui.Upload.prototype.options.localization,{
        "cancel": "Отменить загрузку",
        "dropFilesHere": "перетащите сюда файлы для загрузки",
        "remove": "Удалить",
        "retry": "Повторить",
        "select": "Выбрать...",
        "statusFailed": "загрузка прервана",
        "statusUploaded": "загружено",
        "statusUploading": "загружается",
        "uploadSelectedFiles": "Загрузить выбранные файлы",
        "headerStatusUploaded": "Готово",
        "headerStatusUploading": "Загружается..."
      });
  }

  /* Scheduler messages */

  if (kendo.ui.Scheduler) {
    kendo.ui.Scheduler.prototype.options.messages =
      $.extend(true, kendo.ui.Scheduler.prototype.options.messages,{
        "allDay": "Весь день",
        "cancel": "Отмена",
        "editable": {
          "confirmation": "Вы уверены, что хотите удалить данное событие?"
        },
        "date": "Дата",
        "destroy": "Удалить",
        "editor": {
          "allDayEvent": "Весь день",
          "description": "Описание",
          "editorTitle": "Событие",
          "end": "И",
          "endTimezone": "Часовой пояс 2",
          "repeat": "Повторить",
          "separateTimezones": "использовать разные часовые пояса для начала и окончания события",
          "start": "Начало",
          "startTimezone": "Часовой пояс",
          "timezone": "Часовой пояс",
          "timezoneEditorButton": "Часовой пояс",
          "timezoneEditorTitle": "Часовые пояса",
          "title": "Название",
          "noTimezone": "Без часового пояса"
        },
        "event": "Событие",
        "recurrenceMessages": {
          "deleteRecurring": "Вы хотите удалить только данное событие или всю серию повторяющихся событий?",
          "deleteWindowOccurrence": "Удалить данное событие",
          "deleteWindowSeries": "Удалить серию событий",
          "deleteWindowTitle": "Удалить повторяющееся событие",
          "editRecurring": "Вы хотите редактировать только данное событие или всю серию повторяющихся событий?",
          "editWindowOccurrence": "Редактировать данное событие",
          "editWindowSeries": "Редактировать серию событий",
          "editWindowTitle": "Редактировать повторяющееся событие"
        },
        "save": "Сохранить",
        "time": "Время",
        "today": "Сегодня",
        "views": {
          "agenda": "Список событий",
          "day": "День",
          "month": "Месяц",
          "week": "Неделя",
          "workWeek": "Рабочая неделя"
        },
        "deleteWindowTitle": "Удалить событие",
        "showFullDay": "Показать весь день",
        "showWorkDay": "Показать рабочие часы"
      });
  }

  /* Validator messages */

  if (kendo.ui.Validator) {
    kendo.ui.Validator.prototype.options.messages =
      $.extend(true, kendo.ui.Validator.prototype.options.messages,{
        "required": "{0} обязателен",
        "pattern": "{0} не верен",
        "min": "{0} должен быть больше или равен {1}",
        "max": "{0} должен быть меньше или равен {1}",
        "step": "{0} не верен",
        "email": "{0} не корректный email",
        "url": "{0} не корректный URL",
        "date": "{0} не корректная дата"
      });
  }
})(window.kendo.jQuery);
