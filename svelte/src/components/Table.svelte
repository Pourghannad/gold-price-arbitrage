<script lang="ts">
  export let data: any[] = [];
  export let columns: any[] = [];
  export let initialSortColumn: string = '';
  export let initialSortDirection: 'asc' | 'desc' = 'desc';

  let sortColumn = initialSortColumn;
  let sortDirection = initialSortDirection;

  function handleSort(columnKey: string) {
    if (sortColumn === columnKey) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = columnKey;
      sortDirection = 'asc';
    }
  }

  $: sortedData = !sortColumn
    ? data
    : [...data].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
</script>

<table>
  <thead>
    <tr>
      {#each columns as col}
        <th
          on:click={() => col.sortable && handleSort(col.key)}
          class:sortable={col.sortable}
        >
          {col.header}

          {#if sortColumn === col.key}
            <span>
              {sortDirection === 'asc' ? '▲' : '▼'}
            </span>
          {/if}
        </th>
      {/each}
    </tr>
  </thead>

  <tbody>
    {#each sortedData as row}
      <tr>
        {#each columns as col}
          <td>
            {#if col.render}
              {col.render(row[col.key], row)}
            {:else}
              {row[col.key]}
            {/if}
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }

  th {
    padding: 8px;
    text-align: left;
    border-bottom: 2px solid #ddd;
    user-select: none;
  }

  td {
    padding: 8px;
    border-bottom: 1px solid #ddd;
  }

  .sortable {
    cursor: pointer;
  }

  span {
    margin-left: 4px;
  }
</style>
