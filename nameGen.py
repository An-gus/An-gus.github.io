from string import ascii_lowercase as letters #import a string of lowercase letters
with open("./data/inputNames.txt", "w") as file: #use files context manager
	for num in range(0,10): #loop over integers from 0 to 9
		for letter in letters: #loop over each letter in alphabet
			file.write(letter+str(num)+"\n" if num>0 else letter+"\n") #write the concat of letter and int