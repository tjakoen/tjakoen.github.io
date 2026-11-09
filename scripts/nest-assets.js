// site/nest-assets.js — the shared visual primitives for the colony.
// The game and the note figures both import this file, so there is one definition of the ant cells
// and one sample of the Braille mound. Nothing here is note-only.
export const ANT_BODY = [[0,0],[1,1],[1,2]].concat(
  ["", "", "", ".xxx.xx.xxxxx.", "xxxx.xxx.xxxxx", ".xxx.xx.xxxxx."]
    .flatMap((row, y) => [...row].map((k, x) => (k === "x" ? [x, y] : null)).filter(Boolean)),
);
export const ANT_LEGS_A = [[5,2],[4,1],[9,2],[10,1],[7,6],[8,7],[2,6],[1,7]];
export const ANT_LEGS_B = [[7,2],[8,1],[3,2],[2,1],[5,6],[4,7],[10,6],[11,7]];
export const MAIN_MOUND = "\u2800\u2800\u2800\u2800\u2800\u2800\u2880\u28e0\u2894\u2806\u2800\u2800\u2890\u2896\u28a4\u28c0\u2800\u2800\u2800\u2800\u2800\u2800\n\u2800\u2800\u2800\u2800\u28e0\u28fe\u2895\u2895\u28bd\u2895\u28f5\u28d7\u289d\u2895\u28b5\u28b5\u289d\u28a6\u2840\u2800\u2800\u2800\n\u2800\u2800\u28e0\u289e\u289d\u28b5\u28f5\u2895\u2895\u289d\u2895\u2895\u28bd\u289f\u2895\u289d\u2895\u2895\u289d\u28a6\u2840\u2800\n\u28a0\u28de\u28b7\u2897\u289f\u28f7\u2895\u2895\u289d\u2897\u289d\u28dd\u28dd\u289d\u28dd\u28d5\u2897\u2895\u289d\u2897\u289d\u28a6";
