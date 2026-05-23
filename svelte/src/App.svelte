<script lang="ts">
  import { onMount } from 'svelte';
  import Table from './components/Table.svelte';
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

  let data: ApiResponse | null = null;
  let loading = true;
  let error = '';

  async function fetchData() {
    try {
      loading = true;

      const response = await fetch('https://azard.net/gold/');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      data = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchData();

    const interval = setInterval(fetchData, 305000);

    return () => clearInterval(interval);
  });

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
      render: (value: string) => toJalali(value || `${new Date()}`),
    },
  ];
</script>

<section>
  <h1 class="title">مقایسه قیمت طلا ۱۸ عیار</h1>

  {#if loading}
    <div class="center">... در حال بارگذاری</div>
  {:else if error}
    <div class="center">{error}</div>
  {:else if data}
    <h2>
      میانگین قیمت:
      {englishToPersianDigits(data.average.toFixed(0))}
    </h2>

    <Table
      data={data.results}
      columns={columns}
      initialSortColumn="price"
    />
  {/if}
</section>
