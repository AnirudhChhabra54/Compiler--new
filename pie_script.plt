set terminal png
set output 'pie_chart.png'
set title 'Pie Chart: Gender'
set size square
set style data histogram
set style fill solid
unset xtics
unset ytics
set angles degrees
plot 'pie_data.txt' using 1:2:3 with labels center offset 0,1 title '', '' using 1:2 smooth cumulative with circles lc rgb 'blue' notitle
