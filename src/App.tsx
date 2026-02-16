import Table from "./components/Table/Table";
import { useFetch } from "./hooks/fetch";

function App() {
  const { data, loading } = useFetch({
    url: "https://azard.net/gold/",
    retry: 0,
    interval: 305000
  });

  return (
    <section>
      <h1 className="title">مقایسه قیمت طلا ۱۸ عیار</h1>
      {loading ? "در حال بارگذاری ...." : <Table data={data} />}
    </section>
  );
}

export default App;
