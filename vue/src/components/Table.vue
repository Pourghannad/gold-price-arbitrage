<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  data: any[];
  columns: any[];
  initialSortColumn?: string;
}

const props = defineProps<Props>();

const sortColumn = ref(props.initialSortColumn || '');
const sortDirection = ref<'asc' | 'desc'>('desc');

const sort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value =
      sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
};

const sortedData = computed(() => {
  if (!sortColumn.value) {
    return props.data;
  }

  return [...props.data].sort((a, b) => {
    const aVal = a[sortColumn.value];
    const bVal = b[sortColumn.value];

    if (aVal < bVal) {
      return sortDirection.value === 'asc' ? -1 : 1;
    }

    if (aVal > bVal) {
      return sortDirection.value === 'asc' ? 1 : -1;
    }

    return 0;
  });
});
</script>

<template>
  <table>
    <thead>
      <tr>
        <th
          v-for="column in columns"
          :key="column.key"
          :class="{ sortable: column.sortable }"
          @click="column.sortable && sort(column.key)"
        >
          {{ column.header }}

          <span v-if="sortColumn === column.key">
            {{ sortDirection === 'asc' ? '▲' : '▼' }}
          </span>
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, index) in sortedData" :key="index">
        <td
          v-for="column in columns"
          :key="column.key"
        >
          {{
            column.render
              ? column.render(row[column.key])
              : row[column.key]
          }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: right;
}

.sortable {
  cursor: pointer;
}

tbody tr:hover {
  background: rgba(255,255,255,.04);
}
</style>
