function resize() {
    FROM=$1
    SIZE=$2
    TO=$3
    convert "$FROM" -resize "$SIZE" -gravity center -background transparent -extent "$SIZE" "$TO"
}

# resize 'images/backgrounds/background beach empty.jpg' 1024x1024 assets/beach.jpg
# resize 'images/backgrounds/background hills empty.jpg' 1024x1024 assets/hills.jpg
# resize 'images/backgrounds/background jungle empty.jpg' 1024x1024 assets/jungle.jpg
# resize 'images/backgrounds/background mountain empty.jpg' 1024x1024 assets/mountain.jpg

resize 'images/raw materials/pumpkin + freshwater.png' 128x128 assets/freshwater-pumpkin.png
resize 'images/raw materials/pumpkin + rubber.png' 128x128 assets/sap-pumpkin.png
resize 'images/raw materials/pumpkin + saltwater.png' 128x128 assets/brine-pumpkin.png
resize 'images/raw materials/pumpkin + sand.png' 128x128 assets/sand-pumpkin.png
resize 'images/raw materials/pumpkin empty.png' 128x128 assets/pumpkin.png
resize 'images/raw materials/blue flower.png' 128x128 assets/flower.png
resize 'images/raw materials/reed.png' 128x128 assets/reed.png
# TODO soaked reeds
resize 'images/raw materials/reed.png' 128x128 assets/soaked-reed.png
resize 'images/raw materials/rock.png' 128x128 assets/rock.png
resize 'images/raw materials/rubber.png' 128x128 assets/rubber.png
resize 'images/raw materials/mushroom.png' 128x128 assets/mushroom.png
resize 'images/raw materials/bamboo shoot.png' 128x128 assets/bamboo.png
resize 'images/formed materials/hammer.png' 128x128 assets/hammer.png
resize 'images/formed materials/paper.png' 128x128 assets/paper.png
resize 'images/formed materials/vial brine.png' 128x128 assets/brine-vial.png
resize 'images/formed materials/vial fresh water.png' 128x128 assets/freshwater-vial.png
resize 'images/formed materials/vial empty.png' 128x128 assets/vial.png
resize 'images/formed materials/vial growing potion.png' 128x128 assets/growing-potion.png
resize 'images/formed materials/vial shrinking potion.png' 128x128 assets/shrinking-potion.png
resize 'images/formed materials/airplane.png' 128x128 assets/airplane.png
resize 'images/formed materials/airplane.png' 128x128 assets/giant-airplane.png
resize 'images/formed materials/launchpad + rubberband.png' 128x128 assets/ballista.png

# this is a place holder for missing materials
resize 'images/raw materials/sand.png' 128x128 assets/sand.png

# props
resize 'images/formed materials/pumpkin home.png' 256x256 assets/homestead.png
resize 'images/formed materials/tap.png' 64x64 assets/tap.png
resize 'images/raw materials/lion.png' 128x128 assets/lion.png
resize 'images/formed materials/kitty.png' 64x64 assets/cat.png
resize 'images/formed materials/launchpad + rubberband.png' 256x256 assets/placed-ballista.png
resize 'images/formed materials/launchpad + rubberband + plane.png' 256x256 assets/launch-pad.png
resize 'images/formed materials/bridge.png' 256x256 assets/bridge.png
