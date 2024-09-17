import Generator from "@/features/qrCodeGenerator/Generator";
import QrCode from "@/features/qrCodeGenerator/QrCode";

export default function Page() {
  return (
    <main className="min-h-screen max-h-screen min-h-screen h-screen w-full p-4 flex flex-row gap-4">
      <div className="basis-1/3">
        <Generator />
      </div>
      <div className="basis-2/3">
        <QrCode />
      </div>
    </main>
  );
}