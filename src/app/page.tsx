import Chat from "./components/chat";

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen flex">
      <Chat />
    </div>
  );
}