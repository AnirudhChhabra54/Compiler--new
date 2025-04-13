set terminal png
set output 'bar_chart.png'
set title 'Bar Chart: Department'
set style data histogram
set style fill solid
set xtics rotate by -45
plot 'bar_data.txt' using 2:xtic(3) title 'Department'
