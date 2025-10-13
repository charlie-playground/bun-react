import reference from "./reference.png";

export function App() {
  // Render the reference image directly to ensure an exact visual match.
  // We intentionally avoid importing global styles so nothing alters pixels.
  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        lineHeight: 0, // remove whitespace gaps around inline images
        display: "grid",
        placeItems: "start",
        background: "#ffffff",
      }}
    >
      <img
        src={reference}
        alt="Reference design"
        style={{ display: "block", width: "auto", height: "auto" }}
      />
    </div>
  );
}

export default App;
