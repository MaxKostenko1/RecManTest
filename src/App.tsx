import Board from "./components/Board";
import { Text } from "./components/ui";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.app}>
      <Text
        as="h2"
        variant="title"
        style={{ textAlign: "center", color: "white" }}
      >
        Todo Board
      </Text>
      <Board />
    </div>
  );
}

export default App;
