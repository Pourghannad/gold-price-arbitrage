import Table from "./components/Table/Table";
import { useFetch } from "./hooks/fetch";
import { englishToPersianDigits } from "./utils/stringHelper";
import { toJalali } from "./utils/toJalali";

function App() {
  const { data, loading } = useFetch({
    url: "https://azard.net/gold/",
    retry: 0,
    interval: 305000,
  });

  return (
    <section>
      <h1 className="title">مقایسه قیمت طلا ۱۸ عیار</h1>
      {loading ? (
        "... در حال بارگذاری "
      ) : (
        <>
          <h2>
            میانگین قیمت: {englishToPersianDigits(data.average.toFixed(0))}
          </h2>
          <Table
            initialSortColumn="price"
            columns={[
              {
                key: "source",
                header: "سایت",
              },
              {
                key: "price",
                header: "قیمت",
                sortable: true,
                render: (value) => {
                  return englishToPersianDigits(value as number);
                },
              },
              {
                key: "api_date",
                header: "تاریخ آخرین تغییر",
                render: (value) => {
                  return toJalali(value as any);
                },
              },
            ]}
            data={data?.results}
          />
        </>
      )}
    </section>
  );
}

export default App;
