import { GlobalStyles, darkTheme, lightTheme } from "@styles/globalStyles";
import { AppRouter } from "@utils/routerUtils";
import { useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";

// Web3 Integration Part
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
// End Web3 Integration Part

function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const walletLists = useMemo(
    () => [],
    [network]
  );

  const [theme] = useState<string>("light");

  return (
    <ConnectionProvider endpoint={import.meta.env.VITE_RPC_ENDPOINT?import.meta.env.VITE_RPC_ENDPOINT:network}>
      <WalletProvider wallets={walletLists} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
              <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
                <GlobalStyles />
                <AppRouter />
              </ThemeProvider>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
