#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

/** Remove line breaks **/
void strchop(char * str)
{
	int i;
	for(i=0;str[i]!='\0';i++){	
	    if(str[i]=='\r'){
		  str[i]=' ';
	    }
	    if(str[i]=='\n'){
		  str[i]=' ';
	     }
      }
}

char* getRightSide(const char* string, const char* matcher){
       char *Left;
       char *Right;          
       // first make a copy
       Left = strdup(string); 
       // second locate the desired text
       Right = strstr(Left,matcher);
 
       // third split the string
       *(Right - 1) = '\0';
 
       // print the results
       //printf("getRightSide    Original : %s\nLeft side: %s\nRight side: %s\tMatcher: %s\n\n\n",string,Left,Right,matcher);
 
       // clean up the mess
       free(Left);
       return Right;
}

void removeSubstring(char *s,const char *toremove){
  	while( s=strstr(s,toremove) )
    		memmove(s,s+strlen(toremove),1+strlen(s+strlen(toremove)));
}



char* getLeftSide(const char* string, const char* matcher){
       char *Left;
       char *Right;       
	
       // first make a copy
       Left = strdup(string); 
       // second locate the desired text
	
       Right = strstr(Left,matcher);
 
       // third split the string
       *(Right) = '\0';
 
       // print the results
       //printf("getLeftSide   Original : %s\nLeft side: %s\nRight side: %s  \tMatcher: %s\n\n\n",string,Left,Right,matcher);
 
       // clean up the mess
       //free(Right);
       return Left;
}

char** str_split(char* a_str, const char a_delim){
    char** result    = 0;
    size_t count     = 0;
    char* tmp        = a_str;
    char* last_comma = 0;

    /* Count how many elements will be extracted. */
    while (*tmp){
        if (a_delim == *tmp){
            count++;
            last_comma = tmp;
        }
        tmp++;
    }

    /* Add space for trailing token. */
    count += last_comma < (a_str + strlen(a_str) - 1);

    /* Add space for terminating null string so caller
       knows where the list of returned strings ends. */
    count++;

    result = malloc(sizeof(char*) * count + 100);

    if (result){
        size_t idx  = 0;
        char* token = strtok(a_str, ",");

        while (token){
            assert(idx < count);
            *(result + idx++) = strdup(token);
            token = strtok(0, ",");
        }
	assert(idx == count - 1);
        *(result + idx) = 0;
    }

    return result;
}

char *trimwhitespace(char *str){
  char *end;

  // Trim leading space
  while(isspace(*str)) str++;

  if(*str == 0)  // All spaces?
    return str;

  // Trim trailing space
  end = str + strlen(str) - 1;
  while(end > str && isspace(*end)) end--;

  // Write new null terminator
  *(end+1) = 0;

  return str;
}

void parseParams(char* params){
	removeSubstring(params, "(");
	removeSubstring(params, ")");
	
	
	printf("\tparameters\t:\t\[" );

    	char** tokens;
	//printf("\ntokens\t:\t");
	tokens = str_split(params, ',');

	
	if (tokens){
		int i;
		int param_count = 0;
		for (i = 0; *(tokens + i); i++){
		    param_count ++;
		}
		for (i = 0; i < param_count - 1; i++){
			printf("'%s',", *(tokens + i));
			free(*(tokens + i));
		}
		for (i = param_count - 1; i < param_count; i++){
			printf("'%s'", *(tokens + i));
			free(*(tokens + i));
		}
		free(tokens);
    	}
	printf("],\n");
}

void replace_char_from_string(char from, char to, char *str)
{
    int i = 0;
    int len = strlen(str)+1;

    for(i=0; i<len; i++)
    {
        if(str[i] == from)
        {
            str[i] = to;
        }
    }
}

void parseComments(char* function){
	char *aux = getLeftSide(function, "*/");
	removeSubstring(function, aux);
	removeSubstring(function, "*/");
	removeSubstring(aux, "/*");
	removeSubstring(aux, "'");
	strchop(aux);
	printf("\tcomments\t:\t'%s',\n",aux);
	
}
/*
void parseCommentedFunction(char* function){
	parseComments(function);
	char *aux = getLeftSide(function, "(");
      	removeSubstring(aux, "function");
	char *params = getRightSide(function, "(");
	//printf("\n\t[CLASS] %s\n\t[PARAMS] %s\n",trimwhitespace(aux), params);
	printf("\tclassName\t:\t'%s',\n", trimwhitespace(aux));
	parseParams(params);

}
*/
void parseFunction(char* function){
      	char *aux = getLeftSide(function, "(");
      	removeSubstring(aux, "function");
	char *params = getRightSide(function, "(");
	printf("\tclassName\t:\t'%s',\n", trimwhitespace(aux));
	parseParams(params);
	
}

void parsePrototype(char* function){
	
	printf("\ttype\t\t:\t'method',\n");
	char *aux = getLeftSide(function, ".prototype.");
	printf("\tclassName\t:\t'%s',\n", trimwhitespace(aux));

	char *right = getRightSide(function, ".prototype.");
	char *left = getLeftSide(right, "=");
	
	removeSubstring(left, ".prototype.");
	
	printf("\tname\t\t:\t'%s',\n", left);
	

	char *params = getRightSide(function, "=");
	removeSubstring(params, "function");	
	removeSubstring(params, "=");
	parseParams(params);
	

	
}

void parseCommentedPrototype(char* function){
	
	parseComments(function);
	parsePrototype(function);
	/*char *aux = getLeftSide(function, ".prototype.");
	printf("\t[CLASS] %s\n",trimwhitespace(aux));
	char *right = getRightSide(function, ".prototype.");
	//printf("[right] Class: %s\n",right);
	char *left = getLeftSide(right, "=");
	//printf("[left] Class: %s\n",left);
	removeSubstring(left, ".prototype.");
	printf("\t[FUNCTION] %s\n",left);
	

	char *params = getRightSide(function, "=");
	removeSubstring(params, "function");	
	removeSubstring(params, "=");
	parseParams(params);
	printf("----------");*/
	
}













