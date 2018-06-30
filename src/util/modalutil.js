import queryString from "query-string";

import * as util from "./util";
import * as queueutil from "./queueutil";
import * as gautil from "./gautil";

import * as rpc from "../rpc";

async function show() {
  await rpc.call(
    "insertStylesheet",
    `
        @keyframes hypermask-entrance-animation {
            from {
                transform: scale(0.7) translateY(-600px);
            }
            to {
                transform: scale(1) translateY(0px);
            }
        }
        @keyframes hypermask-exit-animation {
            from {
                transform: scale(1) translateY(0px);
            }
            to {
                transform: scale(0.7) translateY(-700px);
            }
        }
        .hypermask_modal > iframe {
            height: 483px;
            width: 350px;
            background: white;
            border: 0;
        }
    `
  );
  await rpc.call(
    "setStyle",
    `
        position: fixed;
        display: block;
        z-index: 9999999999;
        top: 20px;
        right: 20px;
        border: 1px solid #d8d8d8;
        border-radius: 20px;
        overflow: hidden;
        
        animation-name: hypermask-entrance-animation;
        animation-duration: 0.4s;
        animation-fill-mode:forwards; 

        box-shadow: 0px 3px 14px #21212136;`
  );

  let parent = document.getElementById("payment_frame_parent");
  parent.innerHTML = "";
  parent.className = "";
  parent.style.display = "none";
}

export async function closeModal() {
  let unlock = app.state.mutex.lock();
  await rpc.call("closeModal");
  app.setState({ page: "blank" });
  unlock();
}
