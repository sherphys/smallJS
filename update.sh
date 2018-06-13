git add *

if [ -n "${1}" ]; then 
  git commit -m "${1}"
else
  git commit -m "Actualizando sin comentarios"
fi

git push origin master
