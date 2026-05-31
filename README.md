# ASUS AMD Power Plan Applet

Cinnamon panel applet to limit CPU wattage on ASUS AMD laptops where the fan cannot be controlled due to a firmware-locked embedded controller.

## The problem

This laptop (ASUS Vivobook X512DA) uses an **AMD Ryzen processor**. On AMD-based ASUS laptops, the embedded controller (EC) that manages the fan is **locked at the firmware level** — the manufacturer doesn't expose it to the operating system. This means no software tool can read or write the EC registers that control fan speed.

I tried everything:
- **asus-fan-control (AFC)** — failed with `AE_NOT_FOUND`
- **NBFC-linux** with `ec_sys` / `dev_port` / `acpi_ec` — EC dump returned all zeros
- **pwmconfig** — found no PWM-capable sensors

None of these worked because the hardware blocks software access to the fan controller. Since I **cannot control the fan directly**, the next best thing is to **reduce the heat it needs to deal with** by limiting CPU power limits via RyzenAdj.

## Requirements

- Linux Mint Cinnamon
- AMD Ryzen mobile CPU (Zen/Zen+)
- RyzenAdj installed

## Installation

### 1. Install RyzenAdj

```bash
sudo apt install cmake build-essential libpci-dev
cd /tmp
git clone https://github.com/FlyGoat/RyzenAdj.git
cd RyzenAdj && mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release .. && make -j$(nproc)
sudo make install && sudo ldconfig
```

### 2. Allow running RyzenAdj without password

```bash
echo "$USER ALL=(ALL) NOPASSWD: /usr/local/bin/ryzenadj" | sudo tee /etc/sudoers.d/ryzenadj
```

### 3. Install the applet

```bash
mkdir -p ~/.local/share/cinnamon/applets/
cp -r asus-power-plan@narciso ~/.local/share/cinnamon/applets/
```

### 4. Restart Cinnamon

Press **Alt+F2**, type `r`, enter.

### 5. Add to panel

Right-click the panel → **Applets** → find **ASUS AMD Power Plan** → click **+** to add.

## Usage

- **Left-click**: cycle through Performance → Balanced → Power Saver
- **Right-click**: open menu to pick a plan or open Settings

## Power Profiles

| Profile | STAPM | Fast Limit | Slow Limit | Use Case |
|---------|-------|-----------|------------|----------|
| Performance | 15W | 30W | 25W | Gaming, video editing, heavy load |
| Balanced | 12W | 18W | 15W | Daily browsing, office work |
| Power Saver | 8W | 12W | 10W | Low-load tasks, maximizing battery |

## Custom profiles

Right-click the applet → **Settings** → **Custom Profiles** to add, remove, or edit profiles. Each profile needs an ID, label, STAPM/fast/slow limits in milliwatts, and an icon name (high, medium, or low).

## What this applet does NOT do

- It does **not** control fan speed directly (the hardware won't allow it)
- It does **not** undervolt the CPU (RyzenAdj can't set voltage offsets on Zen+ mobile)
- It does **not** replace Cinnamon's power management
