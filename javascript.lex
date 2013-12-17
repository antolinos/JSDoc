/* 
 * Sample Scanner1: 
 * Description: Replace the string "username" from standard input 
 *              with the user's login name (e.g. lgao)
 * Usage: (1) $ flex sample1.lex
 *        (2) $ gcc lex.yy.c -lfl
 *        (3) $ ./a.out
 *            stdin> username
 *	      stdin> Ctrl-D
 * Question: What is the purpose of '%{' and '%}'?
 *           What else could be included in this section?
 */

%{

#include <unistd.h>
#include "parser.h"
%}

%{
int num_lines = 1, num_chars = 0;
char* fileName;


%}
 
%x 			comment

START_COMMENT		"/**"|"/*"
END_COMMENT		"**/"|"*/"

KEY			"\173"
KEY_CLOSE		"\175"

INSIDE_COMMENT		[^{END_COMMENT}]|WHITE_SPACES|LINE_BREAK|[ \r]|[A-Z]

COMMENT			{CARRIAGE_RETURN}*{START_COMMENT}{INSIDE_COMMENT}*{END_COMMENT}{CARRIAGE_RETURN}*
INLINE_COMMENT		"//"
INLINE_COMMENTS		{INLINE_COMMENT}+
WHITE_SPACES   		[ \t]*
LINE_BREAK   		[ \n]*

DIGIT    		[0-9]
LOWER_CASE_WORD		[a-zA-Z0-9]*
PASCAL_CASE_WORD       	["_"]*[A-Z][a-z0-9"_"]*
PASCAL_CASE_WORDS	{PASCAL_CASE_WORD}*

CAMEL_CASE_WORD       	[A-Z]*[a-z0-9]*
CAMEL_CASE_WORDS	["_"]*{CAMEL_CASE_WORD}*

INHERITANCE_METHOD	{WHITE_SPACES}{PASCAL_CASE_WORD}+".prototype."["_"]*{LOWER_CASE_WORD}+{WHITE_SPACES}
INHERITANCE		{INHERITANCE_METHOD}+"="{INHERITANCE_METHOD}+
/** FUNCTION: function  MeasurementGridHead(param1, param2, para3)  **/
FUNCTION		{FUNCTION_HEADER}
/** COMMENTED_FUNCTION	{COMMENT}+[\r]*[\n]*{FUNCTION} **/
COMMENTED_FUNCTION	{COMMENT}+[ \r]*[ \n]*{FUNCTION}
			

FUNCTION_HEADER		"\n"+{WHITE_SPACES}function[ \t]+{PASCAL_CASE_WORDS}{PARAMS}
PARAMS			{WHITE_SPACES}"("{PARAM}*{LAST_PARAM}*")"{WHITE_SPACES}
PARAM			{WHITE_SPACES}{LOWER_CASE_WORD}{WHITE_SPACES}","
LAST_PARAM		{WHITE_SPACES}{LOWER_CASE_WORD}{WHITE_SPACES}

/** PROTOTYPE: MeasurementGrid.prototype.openAddMeasurementWindow = function(measurements, experiments){ **/
PROTOTYPE		{PASCAL_CASE_WORDS}".prototype."{CAMEL_CASE_WORDS}{WHITE_SPACES}"="{WHITE_SPACES}"function"{PARAMS}
COMMENTED_PROTOTYPE	{COMMENT}+[ \r]*[ \n]*{PROTOTYPE}

CARRIAGE_RETURN		[\n]|[\r]


/** RULES **/
%%
\n						{
							num_lines ++;
							//printf("\n%i", num_lines);
						}
{COMMENT}					{
							num_lines ++;
							//printf("----");
							//printf( "COMMENT: %s\n", yytext ); 
							//printf("----");
						}
{INHERITANCE}					{
							num_lines ++;
							
							char *function = yytext;
							printf("{\n");
									printf("\ttype\t\t:\t'method',\n");
									printf("\tline\t\t:\t'%i',\n", num_lines);
									char *aux = getLeftSide(function, "=");
								      	removeSubstring(aux, "prototype");
									char *className = getLeftSide(aux, "..");

									char *name = getRightSide(aux, "..");
									removeSubstring(name, "..");
									
									printf("\tfile\t\t:\t'%s',\n", fileName);
									printf("\tclassName\t\t:\t'%s',\n", className);
									printf("\tname\t\t:\t'%s',\n", name);
									printf("\tparameters\t\t:\t[],\n");
									
							printf("\n},\n");   
						}
{INLINE_COMMENTS}{PROTOTYPE}			{
							//printf( "{INLINE_COMMENTS}{PROTOTYPE}: %s\n", yytext ); 
						}
{INLINE_COMMENTS}{FUNCTION}			{}


	
{CARRIAGE_RETURN}				{
							
						}

{FUNCTION}	 	   			{
							char *function = yytext;
							
							printf("{\n");
									char *aux = getLeftSide(function, "(");
								      	removeSubstring(aux, "function");
									char *params = getRightSide(function, "(");
									printf("\tline\t\t:\t'%i',\n", num_lines);
									printf("\tfile\t\t:\t'%s',\n", fileName);
									printf("\tclassName\t:\t'%s',\n", trimwhitespace(aux));
									if (strlen(params) > 2){
										parseParams(params);
									}
							printf("\n},\n");   
						} 						


{COMMENT}+[ \r]*[ \n]*{FUNCTION}	 	{
							char *function = yytext;
							printf("{\n");
								parseComments(function);
								char *aux = getLeftSide(function, "(");
							      	removeSubstring(aux, "function");
								char *params = getRightSide(function, "(");
								printf("\tline\t\t:\t'%i',\n", num_lines);
								printf("\tfile\t\t:\t'%s',\n", fileName);
								printf("\tclassName\t:\t'%s',\n", trimwhitespace(aux));
								parseParams(params);
							printf("\n},\n");   
						} 
{PROTOTYPE}					{	
							char *function = yytext;
							
							
							printf("{\n");
								printf("\ttype\t\t:\t'method',\n");
								char *aux = getLeftSide(function, ".prototype.");
								printf("\tline\t\t:\t'%i',\n", num_lines);
								printf("\tfile\t\t:\t'%s',\n", fileName);
								printf("\tclassName\t:\t'%s',\n", trimwhitespace(aux));
								char *right = getRightSide(function, ".prototype.");
								char *left = getLeftSide(right, "=");

								removeSubstring(left, ".prototype.");
								
								printf("\tname\t\t:\t'%s',\n", left);
	
								
								char *params = getRightSide(function, "=");
								
								removeSubstring(params, "function");	
								removeSubstring(params, "=");
								//printf("\tyyparamsff\t\t:\t'%s',\n", params);
								parseParams(params);  
							printf("\n},\n");   
						}
{COMMENTED_PROTOTYPE}				{	
							//printf( "Prototype: %s\n", yytext ); 
							printf("{\n");
							parseCommentedPrototype(yytext); 
							printf("\tline\t\t:\t'%i',\n", num_lines);
							printf("\tfile\t\t:\t'%s',\n", fileName);
							printf("\n},\n");        
						}

						/*printf( "PARAMS: %s\n", yytext );*/

 



     
.           					//printf( "Unrecognized character: %d\t%s\n", yytext[0], yytext );


%%




main(int argc, char **argv)
{
  int i;
	
  if(argc < 2) { /* just read stdin */
    yylex();
    return 0;
  }

   
  printf( "[\n");
  for(i = 1; i < argc; i++) {
    FILE *f = fopen(argv[i], "r");
    fileName = argv[i];
    num_lines = 1;
    if(!f) {
      perror(argv[i]);
      return (1);
    }
    //printf("\tfile\t\t:\t'%s',\n", );
    yyrestart(f);
    //printf("[\n");
    yylex();
    fclose(f);
    //printf("]\n");
    /*printf("%8d %s\n", num_lines, argv[i]);*/


  }
   printf( "]\n");
  return 0;
}

