<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Table from './components/Table.vue';
import { englishToPersianDigits } from './utils/stringHelper';
import { toJalali } from './utils/toJalali';

interface GoldResult {
  source: string;
  price: number;
  api_date: string;
}

interface ApiResponse {
  average: number;
  results: GoldResult[];
}

const data = ref<ApiResponse | null>(null);
const loading = ref(true);
const error = ref('');

const columns = [
  {
    key: 'source',
    header: 'سایت',
    sortable: false,
  },
  {
    key: 'price',
    header: 'قیمت',
    sortable: true,
    render: (value: number) => englishToPersianDigits(value),
  },
  {
    key: 'api_date',
    header: 'تاریخ آخرین تغییر',
    sortable: false,
    render: (value: string) => toJalali(value),
  },
];

const fetchData = async () => {
  try {
    loading.value = true;

    const response = await fetch('https://azard.net/gold/');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    data.value = await response.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();

  setInterval(fetchData, 305000);
});
</script>

<template>
  <section class="container">
    <h1 class="title">مقایسه قیمت طلا ۱۸ عیار</h1>

    <div v-if="loading" class="center">
      در حال بارگذاری...
    </div>

    <div v-else-if="error" class="center">
      {{ error }}
    </div>

    <template v-else-if="data">
      <h2>
        میانگین قیمت:
        {{ englishToPersianDigits(data.average.toFixed(0)) }}
      </h2>

      <Table
        :data="data.results"
        :columns="columns"
        initial-sort-column="price"
      />
    </template>
  </section>
</template>
