#echo - | awk "{printf \"%.1f\",                     
#$((                                                                                                                 
#  $(cat /sys/class/power_supply/BAT0/capacity) * 
#  $(cat /sys/class/power_supply/BAT0/voltage_now) 
#)) / 1000000000000 }" ; echo " W"

#!/bin/bash
# Description: Battery  charge in percentage


#echo - | awk "{printf \"%.1f\",
#$((
#
#  $(grep POWER_SUPPLY_CAPACITY /sys/class/power_supply/BAT0/uevent) +
#  $(grep POWER_SUPPLY_CAPACITY /sys/class/power_supply/BAT1/uevent)
#
#))}";

(grep POWER_SUPPLY_CAPACITY /sys/class/power_supply/BAT1/uevent)


