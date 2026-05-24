import './styles.css';

import { englishToPersianDigits } from './js/utils/stringHelper';
import { toJalali } from './js/utils/toJalali';

const app = document.getElementById('app');

let sortColumn = 'price';
let sortDirection = 'desc';
let currentData = [];

async function fetchGoldPrices() {
  app.innerHTML = '<div class="center">در حال بارگذاری...</div>';

  try {
    const response = await fetch('https://azard.net/gold/');

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const data = await response.json();

    currentData = data.results;

    render(data);
  } catch (error) {
    app.innerHTML = '<div class="center">خطا در دریافت اطلاعات</div>';
  }
}

function sortData(data) {
  return [...data].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (aVal < bVal) {
      return sortDirection === 'asc' ? -1 : 1;
    }

    if (aVal > bVal) {
      return sortDirection === 'asc' ? 1 : -1;
    }

    return 0;
  });
}

function render(data) {
  const sorted = sortData(data.results);

  app.innerHTML = `
    <div class="container">
      <h1 class="title">مقایسه قیمت طلا ۱۸ عیار</h1>

      <h2 class="average">
        میانگین قیمت:
        ${englishToPersianDigits(data.average.toFixed(0))}
      </h2>

      <table>
        <thead>
          <tr>
            <th>سایت</th>
            <th class="sortable" id="price-sort">
              قیمت
              ${sortDirection === 'asc' ? '▲' : '▼'}
            </th>
            <th>تاریخ آخرین تغییر</th>
          </tr>
        </thead>

        <tbody>
          ${sorted.map(item => `
            <tr>
              <td>${item.source}</td>
              <td>${englishToPersianDigits(item.price)}</td>
              <td>${toJalali(item.api_date)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document
    .getElementById('price-sort')
    .addEventListener('click', () => {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

      render({
        average: data.average,
        results: currentData,
      });
    });
}

fetchGoldPrices();

setInterval(fetchGoldPrices, 305000);
