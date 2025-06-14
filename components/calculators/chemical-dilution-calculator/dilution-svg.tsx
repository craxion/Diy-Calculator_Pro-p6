interface DilutionSVGProps {
  concentrateProportion: number // 0 to 1
  diluentProportion: number // 0 to 1
}

export function DilutionSVG({ concentrateProportion, diluentProportion }: DilutionSVGProps) {
  const beakerWidth = 80
  const beakerHeight = 120
  const liquidMaxHeight = beakerHeight - 20 // Max fill height within beaker
  const spacing = 20

  const concentrateFillHeight = Math.max(0, Math.min(liquidMaxHeight, concentrateProportion * liquidMaxHeight))
  const diluentFillHeight = Math.max(0, Math.min(liquidMaxHeight, diluentProportion * liquidMaxHeight))
  const finalMixFillHeight = Math.max(
    0,
    Math.min(liquidMaxHeight, (concentrateProportion + diluentProportion) * liquidMaxHeight),
  )

  // Ensure proportions for final mix are relative to each other if their sum > 1 (should not happen with correct logic)
  // This is more for visual representation of the mix itself.
  const totalProportionInMix = concentrateProportion + diluentProportion
  const finalConcentrateFill =
    totalProportionInMix > 0 ? (concentrateProportion / totalProportionInMix) * finalMixFillHeight : 0
  const finalDiluentFill =
    totalProportionInMix > 0 ? (diluentProportion / totalProportionInMix) * finalMixFillHeight : 0

  const BeakerIcon = ({
    fillLevel = 0,
    primaryColor = "fill-sky-300",
    secondaryColor = "fill-sky-500",
    label,
    xOffset = 0,
  }: { fillLevel: number; primaryColor?: string; secondaryColor?: string; label: string; xOffset?: number }) => (
    <g transform={`translate(${xOffset}, 0)`}>
      <path
        d={`M10 0 L10 ${beakerHeight - 10} Q10 ${beakerHeight} 20 ${beakerHeight} L${beakerWidth - 20} ${beakerHeight} Q${beakerWidth - 10} ${beakerHeight} ${beakerWidth - 10} ${beakerHeight - 10} L${beakerWidth - 10} 0 Z`}
        className="fill-gray-200/70 stroke-gray-400"
        strokeWidth="1"
      />
      {/* Liquid */}
      {fillLevel > 0 && (
        <rect
          x="10"
          y={beakerHeight - fillLevel}
          width={beakerWidth - 20}
          height={fillLevel}
          className={secondaryColor}
        />
      )}
      {/* Top ellipse for liquid */}
      {fillLevel > 0 && (
        <ellipse
          cx={beakerWidth / 2}
          cy={beakerHeight - fillLevel}
          rx={(beakerWidth - 20) / 2}
          ry="3"
          className={primaryColor}
        />
      )}
      {/* Beaker top opening */}
      <ellipse
        cx={beakerWidth / 2}
        cy="0"
        rx={(beakerWidth - 20) / 2}
        ry="3"
        className="fill-gray-300/50 stroke-gray-400"
        strokeWidth="0.5"
      />
      {/* Graduations */}
      {[...Array(4)].map((_, i) => (
        <line
          key={i}
          x1={beakerWidth - 10 - 5}
          y1={beakerHeight - (i + 1) * (liquidMaxHeight / 5)}
          x2={beakerWidth - 10}
          y2={beakerHeight - (i + 1) * (liquidMaxHeight / 5)}
          className="stroke-gray-400"
          strokeWidth="1"
        />
      ))}
      <text x={beakerWidth / 2} y={beakerHeight + 15} textAnchor="middle" className="text-xs fill-gray-600 font-sans">
        {label}
      </text>
    </g>
  )

  const FinalMixBeaker = ({ xOffset = 0 }: { xOffset?: number }) => (
    <g transform={`translate(${xOffset}, 0)`}>
      <path
        d={`M10 0 L10 ${beakerHeight - 10} Q10 ${beakerHeight} 20 ${beakerHeight} L${beakerWidth - 20} ${beakerHeight} Q${beakerWidth - 10} ${beakerHeight} ${beakerWidth - 10} ${beakerHeight - 10} L${beakerWidth - 10} 0 Z`}
        className="fill-gray-200/70 stroke-gray-400"
        strokeWidth="1"
      />
      {/* Diluent part of mix */}
      {finalDiluentFill > 0 && (
        <rect
          x="10"
          y={beakerHeight - finalDiluentFill - finalConcentrateFill}
          width={beakerWidth - 20}
          height={finalDiluentFill}
          className="fill-sky-500"
        />
      )}
      {/* Concentrate part of mix */}
      {finalConcentrateFill > 0 && (
        <rect
          x="10"
          y={beakerHeight - finalConcentrateFill}
          width={beakerWidth - 20}
          height={finalConcentrateFill}
          className="fill-emerald-500"
        />
      )}
      {/* Top ellipse for liquid */}
      {(finalConcentrateFill > 0 || finalDiluentFill > 0) && (
        <ellipse
          cx={beakerWidth / 2}
          cy={beakerHeight - finalConcentrateFill - finalDiluentFill}
          rx={(beakerWidth - 20) / 2}
          ry="3"
          className={finalConcentrateFill > finalDiluentFill ? "fill-emerald-300" : "fill-sky-300"}
        />
      )}
      {/* Beaker top opening */}
      <ellipse
        cx={beakerWidth / 2}
        cy="0"
        rx={(beakerWidth - 20) / 2}
        ry="3"
        className="fill-gray-300/50 stroke-gray-400"
        strokeWidth="0.5"
      />
      {[...Array(4)].map((_, i) => (
        <line
          key={i}
          x1={beakerWidth - 10 - 5}
          y1={beakerHeight - (i + 1) * (liquidMaxHeight / 5)}
          x2={beakerWidth - 10}
          y2={beakerHeight - (i + 1) * (liquidMaxHeight / 5)}
          className="stroke-gray-400"
          strokeWidth="1"
        />
      ))}
      <text x={beakerWidth / 2} y={beakerHeight + 15} textAnchor="middle" className="text-xs fill-gray-600 font-sans">
        Final Mix
      </text>
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${beakerWidth * 3 + spacing * 2} ${beakerHeight + 30}`}
      className="w-full h-auto max-w-sm mx-auto"
    >
      <BeakerIcon
        fillLevel={concentrateFillHeight}
        primaryColor="fill-emerald-300"
        secondaryColor="fill-emerald-500"
        label="Concentrate"
        xOffset={0}
      />
      <text x={beakerWidth + spacing / 2} y={beakerHeight / 2} textAnchor="middle" className="text-2xl fill-gray-500">
        +
      </text>
      <BeakerIcon
        fillLevel={diluentFillHeight}
        primaryColor="fill-sky-300"
        secondaryColor="fill-sky-500"
        label="Diluent"
        xOffset={beakerWidth + spacing}
      />
      <text
        x={beakerWidth * 2 + spacing + spacing / 2}
        y={beakerHeight / 2}
        textAnchor="middle"
        className="text-2xl fill-gray-500"
      >
        =
      </text>
      <FinalMixBeaker xOffset={beakerWidth * 2 + spacing * 2} />
    </svg>
  )
}
