export type Result = {
  ok: boolean;
  /** Texto de la respuesta correcta que se muestra si falla. */
  correct?: string;
  note?: string;
  /** No muestra panel de resultado: pasa directo a la siguiente pantalla. */
  silent?: boolean;
  /** Ejercicio de práctica oral/escrita: no quita vidas ni se repite si falla. */
  soft?: boolean;
  /** El estudiante lo omitió (no suma XP ni aciertos). */
  skipped?: boolean;
};

export type ExProps<T> = {
  ex: T;
  locked: boolean;
  /** Registra la función de comprobación (activa el botón Comprobar) o null para desactivarlo. */
  bind: (fn: (() => Result) | null) => void;
  /** Resultado inmediato (ejercicios que se comprueban solos). */
  auto: (r: Result) => void;
};
