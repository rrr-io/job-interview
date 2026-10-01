import pubmat from "./assets/pubmat.jpg";

export default function App() {
  return (
    <main className="page">
      <div className="pubmat">
        <img
          className="layer"
          src={pubmat}
          alt="Recruitment pubmat: We're hiring."
        />
      </div>
    </main>
  );
}
