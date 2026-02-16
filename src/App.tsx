import Table from "./components/Table/Table";
import { useFetch } from "./hooks/fetch";

function App() {
  const { data, loading } = useFetch({
    url: "https://azard.net/gold/",
    retry: 0,
    interval: 90000
  });

  return (
    <section>
      {loading ? "در حال بارگذاری ...." : <Table data={data} />}
    </section>
  );
}

export default App;
