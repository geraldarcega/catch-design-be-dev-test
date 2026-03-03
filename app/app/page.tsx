import { CustomersDataTable } from "@/components/customers-data-table";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto py-10 px-4">
        <CustomersDataTable />
      </main>
    </div>
  );
}
