set terminal png
set output 'plot.png'
set title 'Plot: Age vs Salary'
set xlabel "Age"
set ylabel "Salary"
plot 'plot_data.txt' using 1:2 with lines title 'Data'
