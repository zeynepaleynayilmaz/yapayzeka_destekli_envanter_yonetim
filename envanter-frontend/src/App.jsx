import FiyatTrendleri from "./components/stacker-bar";
import DoughnutChart from "./components/doughnutChart";
import { Top10StockChart } from "./components/multiaxis";
import { FastestSellingProductsChart } from "./components/2multiaxis";
import Gelirdagilimi from "./components/progressive-line";
import { CategoryRadarChart } from "./components/bar";
import { Page } from "./components/layout/page";
import Satiskiyasla from "./components/satiskiyaslama";
import EnCokSatanChart from "./components/encoksatan";


function App() {
  return (
    <Page>
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stocks Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <Top10StockChart />
        </div>

        {/* Top Stocks Section */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          title="Tıklayınız"
        >
          <EnCokSatanChart />
        </div>

        {/* Fastest Selling Products */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          title="Tıklayınız"
        >
          <FastestSellingProductsChart />
        </div>

        {/* Sales Comparison */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          title="Tıklayınız"
        >
          <Satiskiyasla />
        </div>

        {/* Category Analysis */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          title="Tıklayınız"
        >
          <CategoryRadarChart />
        </div>

        {/* Revenue Distribution */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          title="Tıklayınız"
        >
          <Gelirdagilimi />
        </div>

        {/* Sales Distribution */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          title="Tıklayınız"
        >
          <DoughnutChart />
        </div>

        {/* Price Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <FiyatTrendleri />
        </div>
      </div>
    </Page>
  );
}

export default App;
