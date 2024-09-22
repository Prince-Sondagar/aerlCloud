function createSOCFunction() {
    let previousEMA: number | null = null; // Closure to hold the previousEMA across calls

    return function calculatePowerPlusSOC(voltage: number, smoothingPeriod: number = 50): number {
        // Known voltage and state of charge pairs
        const voltageChargePairs = [
            { voltage: 53.00, charge: 100.00 },
            { voltage: 52.60, charge: 90.00 },
            { voltage: 51.82, charge: 80.00 },
            { voltage: 51.62, charge: 70.00 },
            { voltage: 51.39, charge: 60.00 },
            { voltage: 51.26, charge: 50.00 },
            { voltage: 51.11, charge: 40.00 },
            { voltage: 50.86, charge: 30.00 },
            { voltage: 50.45, charge: 20.00 },
            { voltage: 49.77, charge: 10.00 },
            { voltage: 48.00, charge: 0.00 },
        ];

        // Ensure previousEMA is initialized
        if (previousEMA === null) {
            previousEMA = voltage;
        }

        // EMA smoothing constant
        const K = 2 / (smoothingPeriod + 1);

        // Calculate EMA
        const currentEMA = (voltage * K) + (previousEMA * (1 - K));
        previousEMA = currentEMA; // Update previousEMA

        // Ensure voltage is within the known range
        if (currentEMA >= 53.0) return 100;
        if (currentEMA <= 48.0) return 0;

        // Find the two nearest known points
        let lowerIndex = -1;
        for (let i = 0; i < voltageChargePairs.length - 1; i++) {
            if (currentEMA >= voltageChargePairs[i + 1].voltage && currentEMA < voltageChargePairs[i].voltage) {
                lowerIndex = i;
                break;
            }
        }

        if (lowerIndex === -1) {
            throw new Error("Voltage is out of known range.");
        }

        // Linear interpolation for SOC based on EMA-adjusted voltage
        const lowerPair = voltageChargePairs[lowerIndex];
        const upperPair = voltageChargePairs[lowerIndex + 1];
        const chargeDiff = upperPair.charge - lowerPair.charge;
        const voltageDiff = upperPair.voltage - lowerPair.voltage;
        const chargePerVoltage = chargeDiff / voltageDiff;
        const interpolatedCharge = lowerPair.charge + (currentEMA - lowerPair.voltage) * chargePerVoltage;

        return interpolatedCharge;
    };
}

// Create the SOC function instance with a closure to maintain previousEMA
const calculatePowerPlusSOC = createSOCFunction();

// Now, you can export this function or use it directly
export default calculatePowerPlusSOC;
