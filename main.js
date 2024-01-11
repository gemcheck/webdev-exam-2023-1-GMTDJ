/* eslint-disable no-use-before-define */
/* eslint-disable max-len */

// Всплывающее уведомление (по умолчанию success)
function showAlert(msg, category = 'success') {
    // Получение элемента с классом 'alerts'
    let alerts = document.querySelector('.alerts');
    // Получение шаблона по идентификатору 'alert-template'
    let template = document.getElementById('alert-template');
    // Клонирование первого элемента из содержимого шаблона
    let newAlert = template.content.firstElementChild.cloneNode(true);
    // Заполнение текста сообщения
    newAlert.querySelector('.msg').innerHTML = msg;
    // Добавление нового элемента в 'alerts'
    alerts.append(newAlert);

}

// Вызов уведомления
function alertActionHandler(event) {
    let alertMsg = "Заявка создана";
    if (alertMsg) {
        showAlert(alertMsg, 'success');
    }
}

api_key = "7329443d-45e1-49b4-861e-c3eff9efa7a0";

let allRoutes;
let filteredRoutes;
let currentPageRoutes = 0;
const rowsPerPageRoutes = 10;

let totalRoutesCount = 0;

// Функция для получения данных о маршрутах с сервера
function getRoutes() {

    // Формирование URL для запроса данных о маршрутах
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=${api_key}`;

    // Создание объекта XMLHttpRequest
    
    let xhr = new XMLHttpRequest();

    // Настройка запроса асинхронно
    xhr.open("GET", url); 
    xhr.responseType = "json";

    // Обработчик события завершения загрузки
    xhr.onload = function () {
        // Проверка успешности запроса
        if (xhr.status === 200) {
            // Получение данных о маршрутах
            allRoutes = this.response;
            filteredRoutes = allRoutes;

            // Обновление пагинации и отображение таблицы маршрутов
            updatePagination(1);
            displayRoutesTable();

            // Отображение селектора объектов иных
            displayObjectSelector();
        } else {
            // Вывод сообщения об ошибке
            alert('Ошибка' + this.response.error);
        }
    };

    // Отправка запроса
    xhr.send();
}

// обработчик нажатия на кнопку Оформить
function choiceButtonClick(event) {
    // Получаем все строки таблицы маршрутов
    let guideRows = document.getElementById("routes-list").children;
    // Сбрасываем классы у всех строк таблицы
    for (let i = 0; i < guideRows.length; i++) {
        guideRows[i].className = "";
    }
    // Выделяем текущую строку маршрута
    let rowGuide = event.target.parentNode.parentNode;
    rowGuide.className = "table-warning";

    // Получаем идентификатор маршрута из атрибута кнопки
    let routeId = event.target.getAttribute("route-id");
    // Формируем URL для запроса данных о гидах для выбранного маршрута
    const url = `http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/${routeId}/guides?api_key=${api_key}`;

    // Создаем объект XMLHttpRequest для отправки запроса на сервер
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "json";

    // Отправляем запрос на сервер
    xhr.send();

    // Обработка ответа от сервера
    xhr.onload = function () {
        if (xhr.status === 200) {
            // В случае успешного ответа обновляем данные о гидах и отображаем таблицу гидов
            allGuides = this.response;
            filteredGuides = allGuides;
            displayGuidesTable();
            displayLanguagesSelect();
        } else {
            // В случае ошибки выводим сообщение об ошибке
            alert("Ошибка!" + this.response.error);
        }
    };
}

// Создание элемента для добавления нескольких опций
function createOption(content) {
    // Создаем новый элемент <option>
    const option = document.createElement('option');
    // Устанавливаем значение (value) и текст (text) для созданного элемента
    option.value = content;
    option.text = content;
    return option;
}

// динамическое отображение данных о маршруте
function displayRoutesTable() {
    // Получаем элемент tbody таблицы маршрутов
    let tbody = document.getElementById("routes-list");
    // Очищаем содержимое tbody
    tbody.innerHTML = "";

    // Итерация по данным о маршрутах для отображения на странице
    for (let i = (currentPageRoutes - 1) * rowsPerPageRoutes; i < currentPageRoutes * rowsPerPageRoutes; i++) {
        if (i < totalCount) {
            // Проверка наличия данных о маршруте
            if (filteredRoutes[i] !== undefined) {
                // Создаем новую строку (tr) в таблице
                let row = tbody.insertRow();
                // Добавляем ячейку (td) для отображения имени маршрута
                let name = row.insertCell(0);
                name.innerText = filteredRoutes[i].name.toString();
                // Добавляем ячейку для отображения описания маршрута
                let discr = row.insertCell(1);
                discr.innerText = filteredRoutes[i].description.toString();
                let objects = row.insertCell(2);
                objects.innerText = filteredRoutes[i].mainObject.toString();
                // Добавляем ячейку с кнопкой "Оформить"
                let buttons = row.insertCell(3);
                let button = document.createElement("button");

                // Настройка кнопки
                button.type = "button";
                button.className = "btn btn-warning";
                button.textContent = "Оформить";
                // Идентификации выбранного маршрута при нажатии кнопки
                button.setAttribute("route-id", filteredRoutes[i].id);
                // Привязка к обработчику события choiceButtonClick
                button.addEventListener("click", choiceButtonClick);
                buttons.appendChild(button);
            }
        }
    }
}

// Извлечение уникальных объектов из allRoutes
function getUniqueObjects() {
    // Создаем множество Set для хранения уникальных объектов
    const uniqueObjects = new Set();
     // Делим строки на объекты
    const re = new RegExp("/(\\s-\\s)|(\\s–\\s)|(\\s-\\s)|(\\s-\\s)/");
    for (let i = 0; i < allRoutes.length; i++) {
        // Разбиваем строку на объекты
        let objects = allRoutes[i].mainObject.toString().split(re);
        // Итерация по полученным объектам
        for (let j = 0; j < objects.length; j++) {
            // Проверка, чтобы избежать добавления объектов не в заданном диапазоне длины
            if (objects[j] !== undefined && objects[j].length > 4 && objects[j].length < 25) {
                // Добавляем уникальные объекты в Set
                uniqueObjects.add(objects[j]);
            }
        }
    }
    // Возвращаем Set с уникальными объектами
    return uniqueObjects;
}

// Филтрация маршрутов на основе поиска
function routeSearchFilter() {
    // Получаем значение, введенное пользователем, из элемента с идентификатором "searchName"
    let searchedName = document.getElementById("searchName").value;
    // Вызываем функцию routeObjectFilter (предположительно, фильтрация по объектам)
    routeObjectFilter();

    // Вызываем функцию routeObjectFilter (предположительно, фильтрация по объектам)
    filteredRoutes = filteredRoutes.filter(route => {
        return route.name.toString().includes(searchedName);
    });
    // Сбрасываем текущую страницу маршрутов в 1
    currentPageRoutes = 1;
    // Обновляем с новыми данными
    updatePagination(1);
    // Отображаем таблицу маршрутов с отфильтрованными данными
    displayRoutesTable();
}

// Отображение выпадающего списка
function displayObjectSelector() {
    // Получаем ссылку на элемент <select> по его идентификатору "selectObject"
    let selector = document.getElementById("selectObject");
    // Очищаем содержимое элемента <select>
    selector.innerHTML = '';
    // Добавляем в элемент <select> первый элемент - "Не выбрано"
    selector.appendChild(createOption("Не выбрано"));
    // Получаем уникальные объекты с помощью функции getUniqueObjects
    let uniqueObjects = getUniqueObjects();
    // Итерируемся по уникальным объектам и добавляем их в элемент <select>
    uniqueObjects.forEach(name => {
        selector.appendChild(createOption(name));
    });
}

// Филтрация маршрутов в выпадающем списке
function routeObjectFilter() {
    // Получаем ссылку на элемент <select> с идентификатором "selectObject"
    let selector = document.getElementById("selectObject");
    // Получаем выбранную пользователем опцию из выпадающего списка
    let selectedOption = selector.options[selector.selectedIndex];

    // Сбрасываем текущую страницу маршрутов на 1
    currentPageRoutes = 1;
    // Проверяем, была ли выбрана опция "Не выбрано"
    if (selectedOption.value === "Не выбрано") {
         // Если выбрана "Не выбрано", применяем фильтр ко всем маршрутам
        filteredRoutes = allRoutes;
    } else {
        // В противном случае, фильтруем маршруты на основе выбранного объекта
        filteredRoutes = allRoutes.filter(route => {
            return route.mainObject.toString().includes(selectedOption.value);
        });
    }
    // Обновляем с новыми данными
    updatePagination(1);
    // Отображаем таблицу маршрутов с отфильтрованными данными
    displayRoutesTable();
}

let allGuides;
let filteredGuides;
let currentPageGuides = 0;
const rowsPerPageGuides = 5;

let totalGuidesCount = 0;

// Отображение таблицы с гидами
function displayGuidesTable() {
    // Получаем ссылку на элемент tbody таблицы с идентификатором "guidesBody"
    let tbody = document.getElementById("guidesBody");
    // Очищаем содержимое tbody
    tbody.innerHTML = "";
    // Итерируемся по отфильтрованным гидам и создаем строки таблицы для каждого
    for (let i = (currentPageGuides - 1) * rowsPerPageGuides; i < currentPageGuides * rowsPerPageGuides; i++) {
        // Проверяем, что данные о гиде по данному индексу существуют
        if (i < totalCountGuides) {
            // Проверяем, что данные о гиде по данному индексу существуют
            if (filteredGuides[i] !== undefined) {
                // Новую строка для таблицы
                let row = tbody.insertRow();
                
                // Ячейка для фотографии гида
                let photo = row.insertCell(0);
                photo.innerHTML = '<img src="img/doctor_portrait.jpg" alt="profile_photo" style="width: 75px; height: 75px;">';
                
                // Ячейка для имени гида
                let name = row.insertCell(1);
                name.innerText = filteredGuides[i].name.toString();

                // Ячейка для языка гида
                let language = row.insertCell(2);
                language.innerText = filteredGuides[i].language.toString();

                // Ячейка для опыта работы гида
                let workExperience = row.insertCell(3);
                workExperience.innerText = filteredGuides[i].workExperience.toString();

                // Ячейка для стоимости работы гида в час
                let pricePerHour = row.insertCell(4);
                pricePerHour.innerText = filteredGuides[i].pricePerHour.toString();
                // Ячейка для кнопки "Выбрать"
                let cellButton = row.insertCell(5);
                let button = document.createElement("button");

                // Настраиваем кнопку "Выбрать"
                button.type = "button";
                button.className = "btn btn-warning";
                button.textContent = "Выбрать";
                // Идентификации выбранного гида при нажатии кнопки
                button.setAttribute("guide-id", filteredGuides[i].id);
                // Привязка к обработчику события alertActionHandler
                button.addEventListener("click", alertActionHandler);

                // Добавляем кнопку в ячейку
                cellButton.appendChild(button);
            }
        }
    }
}

// Получения уникальных языков
function getUniqueLanguages() {
    // Создаем множество Set для хранения уникальных языков
    const uniqueLanguages = new Set();
    for (let i = 0; i < allGuides.length; i++) {
        // Добавляем язык текущего гида в множество uniqueLanguages
        uniqueLanguages.add(allGuides[i].language.toString());
    }
    // Возвращаем множество уникальных языков
    return uniqueLanguages;
}

// Вывод языков
function displayLanguagesSelect() {
    // Получаем ссылку на элемент с идентификатором "guideLanguagePlace"
    let selector = document.getElementById("guideLanguagePlace");

    // Очищаем содержимое элемента <select>
    selector.innerHTML = '';

    // Добавляем в элемент первую опцию "Не выбран"
    selector.appendChild(createOption("Не выбран"));

    // Получаем уникальные языки с помощью функции getUniqueLanguages
    let uniqueObjects = getUniqueLanguages();

    // Добавляем уникальные языки
    uniqueObjects.forEach(name => {
        selector.appendChild(createOption(name));
    });
}

// Фильтрация гидов по языку
function guideLanguageFilter() {
    // Получаем ссылку на элемент с идентификатором "guideLanguagePlace"
    let selector = document.getElementById("guideLanguagePlace");

    // Получаем выбранную пользователем опцию из выпадающего списка
    let selectedOption = selector.options[selector.selectedIndex];

    // Проверяем, была ли выбрана опция "Не выбран"
    if (selectedOption.value === "Не выбран") {
        // Если выбрана "Не выбран", применяем фильтр ко всем гидам
        filteredGuides = allGuides;
    } else {
        // В противном случае, фильтруем гидов на основе выбранного языка
        filteredGuides = allGuides.filter(guide => {
            return guide.language.toString() === selectedOption.value;
        });
    }
    // Обновляем с новыми данными
    updatePaginationGuides(1);
    // Отображаем таблицу гидов с отфильтрованными данными
    displayGuidesTable();
}

// Фильтрация гидов по опыту
function guideExpFilter() {
    // Вызываем функцию guideLanguageFilter() для применения фильтрации по языку
    guideLanguageFilter();

    // Получаем значения минимального и максимального опыта из соответствующих полей ввода
    let maxExp = parseInt(document.getElementById("maxExp").value);
    let minExp = parseInt(document.getElementById("minExp").value);

    // Выводим значения в консоль для отладки
    console.log(minExp, maxExp);
    console.log(isNaN(minExp), isNaN(maxExp));

    // Применяем фильтрацию в зависимости от введенных значений
    if (!isNaN(minExp) && isNaN(maxExp)) {
        // Промежуток от
        filteredGuides = filteredGuides.filter(guide =>{
            return parseInt(guide.workExperience) >= minExp;
        });
    } else if (isNaN(minExp) && !isNaN(maxExp)) {
        // Промежуток до
        filteredGuides = filteredGuides.filter(guide =>{
            return parseInt(guide.workExperience) <= maxExp;
        });
    } else if (!isNaN(minExp) && !isNaN(maxExp)) {
        // Промежуток от и до
        filteredGuides = filteredGuides.filter(guide =>{
            return parseInt(guide.workExperience) <= maxExp && parseInt(guide.workExperience) >= minExp;
        });
    }
    // Обновляем с новыми данными
    updatePaginationGuides(1);
    // Отображаем таблицу гидов с отфильтрованными данными
    displayGuidesTable();
}

// Обновление пагинации
function updatePagination(value) {
    // Устанавливаем текущую страницу на значение value
    currentPageRoutes = value;
    // Общее количество отфильтрованных маршрутов
    totalCount = filteredRoutes.length;

    // Обновляем текст элемента, отображающего начальную страницу
    document.getElementById("page-start").innerText = currentPageRoutes.toString();

    // Вычисляем максимальное количество страниц
    let maxPages = filteredRoutes.length / rowsPerPageRoutes;
    if (Math.floor(maxPages) < maxPages) {
        // если дробное, то увеличивает до ближайшего большего целого
        maxPages = Math.floor(maxPages) + 1;
    } else {
        maxPages = Math.floor(maxPages);
    }

    // Обновляем текст элемента, отображающего конечную страницу
    document.getElementById("page-end").innerText = maxPages.toString();
    // Проверяем, является ли текущая страница последней
    let isLastPage = currentPageRoutes >= Math.ceil(totalCount / rowsPerPageRoutes);
    // Проверяем, является ли текущая страница первой
    let isFirstPage = currentPageRoutes === 1;

    // Обновляем классы для кнопок "Далее" и "Назад" в зависимости от текущей страницы
    if (isLastPage) {
        // Если последняя страница, то кнопка "Следующая" не работает
        document.getElementById("next").className = "page-link text-warning disabled";
    } else {
        document.getElementById("next").className = "page-link text-warning";
    }

    if (isFirstPage) {
        // Если первая страница, то кнопка "Предыдущая" не работает
        document.getElementById("prev").className = "page-link disabled text-warning";
    } else {
        document.getElementById("prev").className = "page-link text-warning";
    }
    // Обновляем отображение таблицы маршрутов
    displayRoutesTable();
}

// Обработчик перехода между страницами
function clickOnPagination(event) {
    // Получаем элемент списка, на который был произведен клик
    let listElement = event.target;

    // Проверяем, содержит ли элемент класс "page-link"
    if (listElement.getElementsByClassName("page-link").length === 0) {
        // Проверяем идентификатор элемента и текущую страницу
        if (listElement.id === "next" && currentPageRoutes < filteredRoutes.length / rowsPerPageRoutes) {
            // Переход на страницу вперёд, если это не последняя страница
            updatePagination(parseInt(currentPageRoutes) + 1);
        } else if (listElement.id === "prev" && parseInt(currentPageRoutes) > 1) {
            // Переход на страницу назад, если это не первая страница
            updatePagination(parseInt(currentPageRoutes) - 1);
        }
    }
}

// Обновление страниц с гидами
function updatePaginationGuides(value) {
    // Устанавливаем текущую страницу гидов
    currentPageGuides = value;
    // Устанавливаем общее количество гидов после фильтрации
    totalCountGuides = filteredGuides.length;
    // Обновляем текст для отображения текущей страницы в интерфейсе
    document.getElementById("page-start-guides").innerText = currentPageGuides.toString();

    // Вычисляем максимальное количество страниц для гидов
    let maxPages = filteredGuides.length / rowsPerPageGuides;
    if (Math.floor(maxPages) < maxPages) {
        // Если не целое, то до большего
        maxPages = Math.floor(maxPages) + 1;
    } else {
        maxPages = Math.floor(maxPages);
    }
    // Обновляем текст для отображения максимальной страницы в интерфейсе
    document.getElementById("page-end-guides").innerText = maxPages.toString();

    // Проверяем, является ли текущая страница последней
    let isLastPage = currentPageGuides >= Math.ceil(totalCountGuides / rowsPerPageGuides);
    // Проверяем, является ли текущая страница первой
    let isFirstPage = currentPageGuides === 1;

    if (isLastPage) {
        // Если последняя страница, то кнопка "Следующая" не работает
        document.getElementById("next-guides").className = "page-link text-warning disabled";
    } else {
        document.getElementById("next-guides").className = "page-link text-warning";
    }

    if (isFirstPage) {
        // Если первая страница, то кнопка "Предыдущая" не работает
        document.getElementById("prev-guides").className = "page-link text-warning disabled";
    } else {
        document.getElementById("prev-guides").className = "page-link text-warning";
    }
    // Обновляем отображение таблицы с гидами
    displayGuidesTable();
}

// Обработчик нажатия кнопку выбора гида
function clickOnPaginationGuides(event) {
    // Получаем элемент списка, на который был произведен клик
    let listElement = event.target;

    // Проверяем, содержит ли элемент класс "page-link"
    if (listElement.getElementsByClassName("page-link").length === 0) {
        // Проверяем идентификатор элемента и текущую страницу
        if (listElement.id === "next-guides" && currentPageGuides < filteredGuides.length / rowsPerPageGuides) {
            // Переход на страницу вперёд, если это не последняя страница
            updatePaginationGuides(parseInt(currentPageGuides) + 1);
        } else if (listElement.id === "prev-guides" && parseInt(currentPageGuides) > 1) {
            // Переход на страницу назад, если это не первая страница
            updatePaginationGuides(parseInt(currentPageGuides) - 1);
        }
    }
}

// Заполнение страницы
window.onload = function () {
    // После загрузки страницы вызываем функцию getRoutes() для получения маршрутов
    getRoutes();

    // Слушатель события "input" для элемента с id "searchName". 
    // При изменении в поле ввода вызывается функция routeSearchFilter.
    document.getElementById("searchName").addEventListener("input", routeSearchFilter);
    
    // Слушатель события "change" для элемента с id "selectObject". 
    // При изменении выбранного объекта вызывается функция routeObjectFilter.
    document.getElementById("selectObject").addEventListener("change", routeObjectFilter);
    
    // Слушатель события "click" для элемента с id "pagination". 
    // При клике на кнопки пагинации вызывается функция clickOnPagination.
    document.getElementById("pagination").addEventListener("click", clickOnPagination);

    // Слушатель события "click" для элемента с id "guideExpSearch". 
    // При клике на кнопку поиска гидов вызывается функция guideExpFilter.
    document.getElementById("guideExpSearch").addEventListener("click", guideExpFilter);
    
    // Слушатель события "change" для элемента с id "guideLanguagePlace". 
    // При изменении выбранного языка вызывается функция guideLanguageFilter.
    document.getElementById("guideLanguagePlace").addEventListener("change", guideLanguageFilter);
    
    // Слушатель события "click" для элемента с id "pagination-guides". 
    // При клике на кнопки пагинации для гидов вызывается функция clickOnPaginationGuides.
    document.getElementById("pagination-guides").addEventListener("click", clickOnPaginationGuides);
};