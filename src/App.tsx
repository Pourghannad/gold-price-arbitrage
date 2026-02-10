import { useEffect } from "react";
import Table from "./components/Table/Table";
import { useFetch } from "./hooks/fetch";

function App() {
  const { data, loading } = useFetch({
    url: "https://api.wallgold.ir/api/v1/price?symbol=GLD_18C_750TMN&side=buy",
    retry: 0,
  });

  useEffect(() => {
    console.log("asd", data);
  }, [data]);

  return (
    <section>
      {loading ? 'loading.....' : 
      <Table
        data={[
          {
            website: "https://wallgold.ir/",
            name: "وال گلد",
            priceIRT: data.result.price,
            commission: 0.1,
            last_modified: new Date().getTime(),
          },
        ]}
      />
      }
    </section>
  );
}

export default App;
