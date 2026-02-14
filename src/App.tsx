import Table from "./components/Table/Table";
import { useFetch } from "./hooks/fetch";

function App() {
  const { data: dataWallGold, wallGoldLoading } = useFetch({
    url: "https://api.wallgold.ir/api/v1/price?symbol=GLD_18C_750TMN&side=buy",
    retry: 2,
  });

  const { data: dataMili, miliLoading } = useFetch({
    url: "https://azard.net/gold",
    retry: 2,
  });


  return (
    <section>
      {wallGoldLoading || miliLoading ? 'loading.....' : 
      <Table
        data={[
          {
            website: "https://wallgold.ir/",
            name: "وال گلد",
            priceIRT: dataWallGold?.result?.price,
            commission: 0.1,
            last_modified: new Date().getTime(),
          },
          {
            website: "https://milli.gold/",
            name: "میلی",
            priceIRT: dataMili?.price * 100,
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






