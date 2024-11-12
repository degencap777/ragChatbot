import S from "./index.module.scss";
import "@styles/resource.scss"
import emojiHappy from "@assets/svg/emojiHappy.svg"
import paperAirplane from "@assets/svg/paperAirplane.svg"
import backBtn from "@assets/svg/chevron-left.svg"
import dotHorizonBtn from "@assets/svg/dotsHorizontal.svg"
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from "react";
import clsx from "clsx";

// Web3 integratino Import Settings
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { getBuyTxWithJupiter, getMyTokens } from "@hooks/index";

import {
  PublicKey,
} from '@solana/web3.js'

// Chainlit integration Import Settings--------------------------------------------------------
import { v4 as uuidv4 } from "uuid";
import {
  useChatSession,
  useChatData,
  useChatInteract,
  useChatMessages,
  IStep,
} from "@chainlit/react-client";

// END Chainlit integration Import Settings--------------------------------------------------------

export const Playground = () => {
  // Web3 integration
  const { connection } = useConnection();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();

  const handleWalletConnect = async () => {
    if (wallet.connected) {
      wallet.disconnect()
    } else {
      setVisible(true)
    }
  }

  // Chainlit integration--------------------------------------------------------
  const { connect, disconnect } = useChatSession();
  const { loading } = useChatData();
  const { sendMessage } = useChatInteract();
  const { messages } = useChatMessages();

  // Connect to the WebSocket server
  useEffect(() => {
    connect({
      userEnv: {},
    });

    return () => {
      disconnect();
    };
  }, []);

  const [inputValue, setInputValue] = useState("");
  const [txSig, setTxSig] = useState("");
  const [assets, setAssets] = useState("");

  const handleSendMessage = () => {
    const content = inputValue.trim();
    if (content) {
      const message: IStep = {
        id: uuidv4(),
        name: "",
        type: "user_message",
        output: content,
        createdAt: new Date().toISOString(),
      };
      sendMessage(message, []);
      setInputValue("");
    }
  };

  const renderMessage = (message: IStep) => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(message.createdAt).toLocaleTimeString(
      undefined,
      dateOptions
    );
    /* 
    1. Check 'chat start' or 'on chat' since msg content structure is different with them
      : [conditional statement code] message.name === "on_chat_start"?A:B;
    2. Check whether the response to user's prompt is 'None' or not
      : [conditional statement code] message.steps?.[0]?.steps?.[0]?.output !== undefined && ()
      - Check whether the response is related to excution of token buy, etc
        : [code] message.steps?.[0]?.steps?.[0]?.output.split("--")[0] !== "Execution" ? A:B;
        * Check whether txSig is None or not.
    */
    return (
      <div key={message.id} style={{ width: '100%' }}>
        {message.name === "on_chat_start" ? (
          <div className={S.userDialog}>
            <div className={S.avatar}>AI</div>
            <div>
              <div className={S.userMessage}>{message.steps?.[0]?.output}</div>
              <p>{date}</p>
            </div>
          </div>
        ) : (
          <>
            <div className={S.aiDialog}>
              <div className={S.avatar}>You</div>
              <div>
                <div className={S.aiMessage}>{(message.output)}</div>
                <p>{date}</p>
              </div>
            </div>
            {/* response to the user prompt */}
            {message.steps?.[0]?.steps?.[0]?.output !== undefined && (
              <>
                {message.steps?.[0]?.steps?.[0]?.output.split("--")[0] !== "Execution" ?
                  (<div className={S.userDialog}>
                    <div className={S.avatar}>AI</div>
                    <div>
                      <div className={S.userMessage}>{message.steps?.[0]?.steps?.[0]?.output}</div>
                      <p>{date}</p>
                    </div>
                  </div>) :
                  (
                    <div className={S.userDialog}>
                      <div className={S.avatar}>AI</div>
                      <div>
                        {txSig.length !== 0 && assets.length === 0 && (
                          <div>
                            <div className={S.userMessage}>Success in buy transaction: <a href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noopener noreferrer">https://solscan.io/tx/{txSig}</a></div>
                            <p>{date}</p>
                          </div>
                        )}
                        {txSig.length === 0 && assets.length === 0 && (
                          <div>
                            <div className={S.userMessage}>Transaction failed or no assets are there in this wallet.</div>
                            <p>{date}</p>
                          </div>
                        )}
                        {txSig.length === 0 && assets.length !== 0 && (
                          <div>
                            <div className={S.userMessage}>{assets}</div>
                            <p>{date}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
              </>
            )}
          </>
        )}
      </div>
    );
  };
  // END Chainlit Integration--------------------------------------------------------

  useEffect(() => {
    const fetchAndExecute = async () => {
      if (messages.length > 0) {
        const asw_on_last_qn = messages[messages.length - 1].steps?.[0]?.steps?.[0]?.output;
        const prefix = asw_on_last_qn?.split("--")[0];
        console.log("msgs: ", messages)

        if (prefix === "Execution") {
          const token_name = asw_on_last_qn?.split("--")[1];
          const baseMint = asw_on_last_qn?.split("--")[2];
          const token_amount = asw_on_last_qn?.split("--")[3];
          if (token_name == "wallet") {
            let assetsInfo = await getMyTokens(wallet.publicKey!, connection);
            console.log('assets: ', assetsInfo)
            setAssets(assetsInfo);
          }
          else if (token_name && baseMint && token_amount) {
            try {
              // Await the transaction retrieval
              const tx = await getBuyTxWithJupiter(wallet, new PublicKey(baseMint), Number(token_amount), connection);
              console.log("tx", tx)

              // Check if tx is null before proceeding
              if (tx) {

                const latestBlockhash = await connection.getLatestBlockhash();
                tx.message.recentBlockhash = latestBlockhash.blockhash;
                // wallet.signTransaction(walletSendTx);
                console.log(
                  (await connection.simulateTransaction(tx, undefined)).value
                    .logs
                );

                const txSig = await wallet.sendTransaction(tx, connection, {
                  skipPreflight: true,
                  preflightCommitment: "confirmed",
                });
                console.log('Transaction Signature:', txSig);
                const res = await connection.confirmTransaction(txSig, "confirmed");
                console.log("res", res);

                setTxSig(txSig);
                // Optionally handle txSig or log it

              } else {
                console.error('Transaction could not be created.');
              }
            } catch (error) {
              console.error('Error executing transaction:', error);
            }
          }
        }
      }
    };

    fetchAndExecute();
  }, [messages]);

  return (
    <div className={S.body}>
      <div className={S.titleBar}>
        <div className={S.title}>VaLAI</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button className={S.walletBtn} onClick={handleWalletConnect}>{wallet.connected ? wallet?.publicKey?.toBase58().slice(0, 10) : "Connect Wallet"}</button>
        </div>
      </div>
      <div className={S.playground}>
        <div className={S.chattingBar}>
          <div className={S.chatTitleBar}>
            <div className={S.backChatBtn}>
              <img src={backBtn} alt="" />
            </div>
            <div className={S.userBar}>
              {/* <div className={S.avatar}>AD</div>
              <div className={S.userName}>Jason Admin</div> */}
            </div>
            <div className={S.externalBtn}>
              <img src={dotHorizonBtn} alt="" />
            </div>
          </div>
          <div className={S.workspace}>
            {messages.map((message) => renderMessage(message))}
          </div>
          <div className={S.promptInputBar}>
            <div className={S.emotic}>
              <img src={emojiHappy} alt="" />
            </div>
            <div className={S.promptInput}>
              <input
                autoFocus
                className={S.inputWidget}
                type="text"
                id="message-input"
                placeholder="Type here..."
                value={inputValue}
                disabled={loading}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }
                }
              />
            </div>
            <button className={clsx(S.sendBtn, loading && S.disabled)} disabled={loading} onClick={handleSendMessage} type="submit">
              <img src={paperAirplane} alt="" style={{ transform: "rotate(90deg)" }} />
            </button>
          </div>
        </div>
      </div>
      <Toaster position='bottom-right' />
    </div>
  );
};

