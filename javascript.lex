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
int num_lines = 0, num_chars = 0;



%}

%x 			comment

START_COMMENT		"/**"
END_COMMENT		"**/"
		
COMMENT			{CARRIAGE_RETURN}*{START_COMMENT}[^"**/"]*{END_COMMENT}{CARRIAGE_RETURN}*
INLINE_COMMENT		"//"
INLINE_COMMENTS		{INLINE_COMMENT}+
WHITE_SPACES   		[ \t]*
LINE_BREAK   		[ \n]*

DIGIT    		[0-9]
LOWER_CASE_WORD		[a-zA-Z0-9]*
PASCAL_CASE_WORD       	["_"]*[A-Z][a-z0-9]*
PASCAL_CASE_WORDS	{PASCAL_CASE_WORD}*

CAMEL_CASE_WORD       	[A-Z]*[a-z0-9]*
CAMEL_CASE_WORDS	["_"]*{CAMEL_CASE_WORD}*


/** FUNCTION: function  MeasurementGridHead(param1, param2, para3)  **/
FUNCTION		{FUNCTION_HEADER}
/** COMMENTED_FUNCTION	{COMMENT}+[\r]*[\n]*{FUNCTION} **/
COMMENTED_FUNCTION	{COMMENT}+[ \r]*[ \n]*{FUNCTION}
			

FUNCTION_HEADER		{WHITE_SPACES}function[ \t]+{PASCAL_CASE_WORDS}{PARAMS}
PARAMS			{WHITE_SPACES}"("{PARAM}*{LAST_PARAM}*")"{WHITE_SPACES}
PARAM			{WHITE_SPACES}{LOWER_CASE_WORD}{WHITE_SPACES}","
LAST_PARAM		{WHITE_SPACES}{LOWER_CASE_WORD}{WHITE_SPACES}

/** PROTOTYPE: MeasurementGrid.prototype.openAddMeasurementWindow = function(measurements, experiments){ **/
PROTOTYPE		{PASCAL_CASE_WORDS}".prototype."{CAMEL_CASE_WORDS}{WHITE_SPACES}"="{WHITE_SPACES}"function"{PARAMS}
COMMENTED_PROTOTYPE	{COMMENT}+[ \r]*[ \n]*{PROTOTYPE}

CARRIAGE_RETURN		[\n]|[\r]


/** RULES **/
%%
{INLINE_COMMENTS}{PROTOTYPE}			{
							//printf( "XX: %s\n", yytext ); 
						}
{INLINE_COMMENTS}{FUNCTION}			{}
{CARRIAGE_RETURN}				{
							//printf( "cr: %s\n", yytext ); 
						}
{FUNCTION}	 	   			{
							//printf( "Class: %s\n", yytext ); 
							printf("{\n");
							parseFunction(yytext);  
							printf("\n},\n");   
						} 						
{COMMENT}+[ \r]*[ \n]*{FUNCTION}
/*{COMMENTED_FUNCTION}	 	   		{
							//parseComments(yytext); 
							printf("{\n");
							parseCommentedFunction(yytext); 
							printf("\n},\n");   
						} */
{PROTOTYPE}					{	
							//printf( "Prototype: %s\n", yytext ); 
							printf("{\n");
							parsePrototype(yytext); 
							printf("\n},\n");    
						}
{COMMENTED_PROTOTYPE}				{	
							//printf( "Prototype: %s\n", yytext ); 
							printf("{\n");
							
							parseCommentedPrototype(yytext); 
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

   

  for(i = 1; i < argc; i++) {
    FILE *f = fopen(argv[i], "r");
  
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
 
  return 0;
}

