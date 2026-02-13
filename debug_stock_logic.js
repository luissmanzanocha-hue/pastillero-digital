
// Mock user data
const medications = [
    {
        name: "Test Med",
        status: "active",
        currentStock: 4,               // User says stock is 4
        startDate: "2026-02-01",       // User: starts Feb 1
        treatmentDays: 30,             // User: 30 days
        dosagePattern: "1-0-1",        // Assumption: 2 pills/day
        doseType: "pill",
        pillFraction: 1
    }
];

const todayOverride = new Date("2026-02-08"); // Assumption: Today is Feb 8

const lowStockCount = medications.reduce((count, med) => {
    if (!med.currentStock || !med.dosagePattern) return count;

    const dailyDoses = med.dosagePattern.split('-').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    const pillFraction = med.doseType === 'fraction' ? parseFloat(med.pillFraction) : 1;
    const dailyUsage = dailyDoses * pillFraction;

    if (dailyUsage === 0) return count;

    if (!med.startDate || !med.treatmentDays) {
        const daysRemaining = Math.floor(med.currentStock / dailyUsage);
        return daysRemaining <= 5 ? count + 1 : count;
    }

    const start = new Date(med.startDate);
    const today = todayOverride; // Use fixed date for reproduction
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const treatmentDuration = parseInt(med.treatmentDays) || 30;

    console.log(`Med: ${med.name}`);
    console.log(`Start: ${start.toISOString()}, Today: ${today.toISOString()}`);
    console.log(`Days Passed: ${daysPassed}`);
    console.log(`Daily Usage: ${dailyUsage}`);
    console.log(`Current Stock: ${med.currentStock}`);

    let pillsNeeded = 0;

    if (daysPassed < 0) {
        pillsNeeded = treatmentDuration * dailyUsage;
    } else if (daysPassed < treatmentDuration) {
        const daysRemaining = treatmentDuration - daysPassed;
        pillsNeeded = daysRemaining * dailyUsage;
    } else {
        pillsNeeded = 0;
    }

    console.log(`Pills Needed: ${pillsNeeded}`);
    console.log(`Balance: ${med.currentStock - pillsNeeded}`);

    // Logic check
    return (med.currentStock - pillsNeeded) < 0 ? count + 1 : count;
}, 0);

console.log("Low Stock Count:", lowStockCount);
