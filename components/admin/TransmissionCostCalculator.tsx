"use client";

import { useState, type Dispatch, type SetStateAction } from "react";

const MUX_INPUT_RATE_1080P = 0.03125;
const MUX_SIMULCAST_RATE = 0.02;

type NumberFieldProps = {
  label: string;
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  min: number;
  max: number;
  step: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function NumberField({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: NumberFieldProps) {
  return (
    <label className="text-xs text-white/70">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          setValue(
            Math.min(max, Math.max(min, Number(event.target.value) || min)),
          )
        }
        className="mt-2 min-h-10 w-full rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-bold text-white outline-none focus:border-sky-300"
      />
    </label>
  );
}

export default function TransmissionCostCalculator() {
  const [hoursPerEvent, setHoursPerEvent] = useState(2);
  const [eventsPerMonth, setEventsPerMonth] = useState(4);
  const [destinations, setDestinations] = useState(4);
  const [bitrate, setBitrate] = useState(6);

  const minutes = hoursPerEvent * eventsPerMonth * 60;
  const input = minutes * MUX_INPUT_RATE_1080P;
  const simulcast = minutes * destinations * MUX_SIMULCAST_RATE;
  const total = input + simulcast;
  const uploadMin = bitrate * destinations * 1.5;
  const uploadIdeal = bitrate * destinations * 2;

  return (
    <div className="mt-6 rounded-2xl bg-[#071523] p-5 text-white sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-300">
            Calculadora orientativa
          </p>
          <h3 className="mt-2 text-lg font-bold">
            Costo Mux y subida necesaria con Aitum
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField
              label="Horas/evento"
              value={hoursPerEvent}
              setValue={setHoursPerEvent}
              min={0.5}
              max={12}
              step={0.5}
            />
            <NumberField
              label="Eventos/mes"
              value={eventsPerMonth}
              setValue={setEventsPerMonth}
              min={1}
              max={31}
              step={1}
            />
            <NumberField
              label="Redes"
              value={destinations}
              setValue={setDestinations}
              min={1}
              max={6}
              step={1}
            />
            <NumberField
              label="Mbps de video"
              value={bitrate}
              setValue={setBitrate}
              min={1}
              max={15}
              step={0.5}
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">
              Mux estimado al mes
            </p>
            <p className="mt-1 text-2xl font-bold">{money(total)}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">
              Entrada {money(input)} + simulcast {money(simulcast)}. No incluye
              almacenamiento ni entrega a espectadores.
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">
              Subida para Aitum
            </p>
            <p className="mt-1 text-2xl font-bold">
              {uploadMin.toFixed(0)}–{uploadIdeal.toFixed(0)} Mbps
            </p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">
              Margen recomendado de 1.5× a 2× para {destinations} salidas
              directas de {bitrate} Mbps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
